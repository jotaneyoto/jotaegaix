export default async function handler(req, res) {
  // Configuração de CORS necessária para a Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. USE APENAS O TOKEN SECRETO (DICESK)
  const SEU_TOKEN = "dicesk_live_bc38aad5a43f54cccdcac5c7681703a8ba849d809bf83700";

  if (req.method === "POST") {
    try {
      const { amount, buyerName } = req.body;
      const randomId = Date.now();

      // 2. ESTRUTURA EXATA DO SEU CURL
      const payload = {
        "product_name": "Pacote de Titulos",
        "amount": parseFloat(amount),
        "payer": {
          "name": buyerName || "Cliente",
          "email": `cliente.${randomId}@email.com`,
          "document": "36544466042" // CPF que apareceu no seu log de sucesso
        }
      };

      console.log("Iniciando tentativa com estrutura Curl...");

      const response = await fetch("https://api.use-dice.com/api/v2/payments/deposit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SEU_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Resposta da Dice:", JSON.stringify(data));

      if (data.qr_code_text) {
        return res.status(200).json({
          qr_code_text: data.qr_code_text,
          transaction_id: data.id
        });
      }

      // Retorna o erro detalhado da Dice para o log da Vercel
      return res.status(401).json({ error: "Erro Dice", detail: data.detail || data });

    } catch (error) {
      console.error("Erro no processamento:", error);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
}
