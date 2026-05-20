const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { Resend } = require("resend");

initializeApp();

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

exports.deliverMemories = onSchedule(
  {
    schedule: "every 1 minutes",
    secrets: [RESEND_API_KEY],
  },
  async () => {
    const db = getFirestore();
    const resend = new Resend(RESEND_API_KEY.value());
    const now = Timestamp.now();

    // Query all scheduled memories due for delivery
    const snapshot = await db
      .collection("memories")
      .where("status", "==", "Scheduled")
      .where("scheduledAt", "<=", now)
      .get();

    if (snapshot.empty) {
      console.log("No memories due for delivery.");
      return;
    }

    console.log(`Found ${snapshot.size} memories to deliver.`);

    const deliveries = snapshot.docs.map(async (docSnap) => {
      const memory = docSnap.data();
      const docRef = db.collection("memories").doc(docSnap.id);

      // Prevent duplicate sends — mark in-progress first
      await docRef.update({ status: "Sending" });

      try {
        // Resolve recipient email
        let toEmail = memory.recipient;

        if (memory.recipient === "self") {
          // Fetch user's email from Auth
          const { getAuth } = require("firebase-admin/auth");
          const userRecord = await getAuth().getUser(memory.userId);
          toEmail = userRecord.email;
        }

        // Send the email via Resend
        await resend.emails.send({
          from: "Cue <onboarding@resend.dev>",
          to: toEmail,
          subject: `A memory has arrived: ${memory.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background:#0A0F1E;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0F1E;padding:40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
                      
                      <!-- Header -->
                      <tr>
                        <td style="padding:40px;background:linear-gradient(135deg,#0F172A,#1a2540);border-radius:20px 20px 0 0;border:1px solid rgba(255,255,255,0.08);border-bottom:none;text-align:center;">
                          <p style="margin:0 0 8px;font-size:13px;color:#6495ED;letter-spacing:0.1em;text-transform:uppercase;">A memory sealed in time has arrived</p>
                          <h1 style="margin:0;font-size:32px;color:#F0F4FF;font-weight:300;letter-spacing:-0.02em;">${memory.title}</h1>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px;background:#0F172A;border:1px solid rgba(255,255,255,0.08);border-top:none;border-bottom:none;">
                          <p style="margin:0 0 24px;font-size:14px;color:#6B7FA3;">
                            Sealed on ${new Date(memory.createdAt?.toDate?.() || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · 
                            Delivered today
                          </p>
                          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
                            <p style="margin:0;font-size:17px;color:#F0F4FF;line-height:1.8;white-space:pre-wrap;">${memory.message}</p>
                          </div>

                          ${memory.fileUrl ? `
                          <div style="margin-top:24px;text-align:center;">
                            <a href="${memory.fileUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6495ED,#7C3AED);color:white;text-decoration:none;border-radius:100px;font-size:14px;">
                              View Attachment →
                            </a>
                          </div>
                          ` : ""}
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding:32px 40px;background:#0A0F1E;border-radius:0 0 20px 20px;border:1px solid rgba(255,255,255,0.08);border-top:1px solid rgba(255,255,255,0.04);text-align:center;">
                          <p style="margin:0 0 8px;font-size:13px;color:#6495ED;font-weight:500;">Cue</p>
                          <p style="margin:0;font-size:12px;color:#6B7FA3;">Memories that outlive the present.</p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        });

        // Mark as delivered
        await docRef.update({
          status: "Delivered",
          deliveredAt: Timestamp.now(),
        });

        console.log(`✓ Delivered: ${memory.title} → ${toEmail}`);
      } catch (err) {
        console.error(`✗ Failed to deliver ${docSnap.id}:`, err);
        await docRef.update({
          status: "Failed",
          failedAt: Timestamp.now(),
          failureReason: err.message,
        });
      }
    });

    await Promise.allSettled(deliveries);
  }
);