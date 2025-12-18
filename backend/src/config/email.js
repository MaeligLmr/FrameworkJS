import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  service : 'gmail',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Vérifier la configuration au démarrage
transporter.verify(function (error, success) {
  if (error) {
    console.error('Erreur configuration email:', error);
  } else {
    console.log('Serveur email prêt');
  }
});

export const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Blog App'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Bienvenue sur le blog',
    html: `
      <h1>Bienvenue ${username} !</h1>
      <p>Merci de votre inscription. Vous pouvez dès maintenant vous connecter et publier vos articles.</p>
      <p>Bon blogging !</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email, token, username) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
  
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Blog App'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <h1>Bonjour ${username},</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
      <p>Ou copiez ce lien dans votre navigateur :</p>
      <p>${resetUrl}</p>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;
