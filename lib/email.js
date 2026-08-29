import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function enviarEmailRecuperacao(email, link) {
    try {
        console.log(">>> Tentando enviar e-mail...");
        console.log(">>> Remetente:", process.env.EMAIL_USER);
        console.log(">>> Destinatário:", email);

        const info = await transporter.sendMail({
            from: `"GeoConnect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Redefinição de senha - GeoConnect",
            html: `
                <h2>Redefinição de senha</h2>

                <p>Você solicitou a redefinição da sua senha no GeoConnect.</p>

                <p>Clique no botão abaixo para criar uma nova senha:</p>

                <a href="${link}"
                   style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #0d6efd;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                   ">
                    Redefinir minha senha
                </a>

                <p>Esse link ficará disponível por 1 hora.</p>

                <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
            `
        });

        console.log(">>> ✅ E-mail enviado!");
        console.log(">>> Message ID:", info.messageId);

        return info;

    } catch (error) {
        console.error(">>> ❌ ERRO AO ENVIAR E-MAIL:");
        console.error(error);

        throw error;
    }
}