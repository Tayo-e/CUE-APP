const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { Resend } = require("resend");
initializeApp();
const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

const { onCall } = require("firebase-functions/v2/https");

const { onDocumentCreated } = require("firebase-functions/v2/firestore");

const welcomeEmailHtml = (name = "Friend") => `
  <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0A0F1E; color: #F0F4FF; padding: 44px 36px; border-radius: 20px;">
    <p style="margin:0 0 12px;font-size:13px;color:#6495ED;letter-spacing:0.1em;text-transform:uppercase;">Welcome to Cue</p>
    <h1 style="font-size: 30px; line-height:1.2; margin: 0 0 18px;">Your future has a place now, ${name}.</h1>
    <p style="font-size: 16px; line-height: 1.7; color: #94A3B8; margin: 0 0 22px;">
      Cue helps you seal letters, photos, videos, and voice notes for the moment they will matter most.
    </p>
    <p style="font-size: 16px; line-height: 1.7; color: #94A3B8; margin: 0 0 36px;">
      Start with one message to your future self, a birthday note, or a memory someone should receive later.
    </p>
    <a href="https://cue-app.dev/dashboard"
       style="background: linear-gradient(135deg, #6495ED, #7C3AED); color: white; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 15px;">
      Seal Your First Cue
    </a>
    <p style="margin-top: 44px; font-size: 13px; color: #6B7FA3;">
      With care,<br/>The Cue Team
    </p>
  </div>
`;

async function sendWelcomeEmailOnce({ userId, email, name }) {
  if (!email) {
    console.log("Skipped welcome email: no recipient email.");
    return { skipped: true };
  }

  const db = getFirestore();
  const userRef = userId ? db.collection("users").doc(userId) : null;

  if (userRef) {
    const claimed = await db.runTransaction(async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists ? userSnap.data() : {};

      if (userData.welcomeEmailSent || userData.welcomeEmailSending) {
        return false;
      }

      transaction.set(
        userRef,
        {
          welcomeEmailSending: true,
          welcomeEmailStartedAt: Timestamp.now(),
        },
        { merge: true },
      );
      return true;
    });

    if (!claimed) {
      return { skipped: true, reason: "already-claimed" };
    }
  }

  try {
    const resend = new Resend(RESEND_API_KEY.value());
    await resend.emails.send({
      from: "Cue <hello@cue-app.dev>",
      to: email,
      subject: "Welcome to Cue",
      html: welcomeEmailHtml(name),
    });

    if (userRef) {
      await userRef.set(
        {
          welcomeEmailSent: true,
          welcomeEmailSentAt: Timestamp.now(),
          welcomeEmailSending: false,
        },
        { merge: true },
      );
    }
  } catch (err) {
    if (userRef) {
      await userRef.set(
        {
          welcomeEmailSending: false,
          welcomeEmailFailure: err.message,
          welcomeEmailFailedAt: Timestamp.now(),
        },
        { merge: true },
      );
    }
    throw err;
  }

  return { success: true };
}

exports.sendWelcomeOnSignup = onDocumentCreated(
  { document: "users/{userId}", secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data.data();
    return sendWelcomeEmailOnce({
      userId: event.params.userId,
      email: data.email,
      name: data.name,
    });
  },
);

exports.sendWelcomeEmail = onCall(
  { secrets: [RESEND_API_KEY] },
  async (request) => {
    const { email, name } = request.data;
    return sendWelcomeEmailOnce({
      userId: request.auth?.uid,
      email,
      name,
    });
  },
);

exports.deliverMemories = onSchedule(
  {
    schedule: "every 1 minutes",
    secrets: [RESEND_API_KEY],
  },
  async () => {
    const db = getFirestore();
    const resend = new Resend(RESEND_API_KEY.value());
    const now = Timestamp.now();

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

      await docRef.update({ status: "Sending" });

      try {
        let toEmail = memory.recipient;

        if (memory.recipient === "self") {
          const { getAuth } = require("firebase-admin/auth");
          const userRecord = await getAuth().getUser(memory.userId);
          toEmail = userRecord.email;
        }

        await resend.emails.send({
          from: "Cue <hello@cue-app.dev>",
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
                      <tr>
                        <td style="padding:40px;background:linear-gradient(135deg,#0F172A,#1a2540);border-radius:20px 20px 0 0;border:1px solid rgba(255,255,255,0.08);border-bottom:none;text-align:center;">
                          <p style="margin:0 0 8px;font-size:13px;color:#6495ED;letter-spacing:0.1em;text-transform:uppercase;">A memory sealed in time has arrived</p>
                          <h1 style="margin:0;font-size:32px;color:#F0F4FF;font-weight:300;letter-spacing:-0.02em;">${memory.title}</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:40px;background:#0F172A;border:1px solid rgba(255,255,255,0.08);border-top:none;border-bottom:none;">
                          <p style="margin:0 0 24px;font-size:14px;color:#6B7FA3;">
                            Sealed on ${new Date(memory.createdAt?.toDate?.() || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · Delivered today
                          </p>
                          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px;">
                            <p style="margin:0;font-size:17px;color:#F0F4FF;line-height:1.8;white-space:pre-wrap;">${memory.message}</p>
                          </div>
                          ${
                            memory.fileUrl
                              ? `
                          <div style="margin-top:24px;text-align:center;">
                            <a href="${memory.fileUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#6495ED,#7C3AED);color:white;text-decoration:none;border-radius:100px;font-size:14px;">
                              View Attachment →
                            </a>
                          </div>
                          `
                              : ""
                          }
                        </td>
                      </tr>
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
  },
);
