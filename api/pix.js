export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN = "dicesk_live_bc38aad5a43f54cccdcac5c7681703a8ba849d809bf83700";

  if (req.method === "POST") {
    try {
      const { amount, buyerName, buyerPhone } = req.body;
      const randomId = Date.now();

      // Versão V1 - Mais compatível com chaves novas
      const bodyV1 = {
        amount: Number(amount),
        product_name: "Titulos", 
        payer_name: buyerName || "Cliente",
        payer_email: `c.${randomId}@gmail.com`,
        payer_document: "12345678909" // Teste com um CPF fixo comum primeiro
      };

      console.log("Tentando API V1 com dados simplificados...");

      const response = await fetch("https://api.use-dice.com/api/v1/payments/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify(bodyV1)
      });

      const data = await response.json();
      console.log("Resposta Dice V1:", JSON.stringify(data));

      if (data.qr_code_text) {
        return res.status(200).json({
          qr_code_text: data.qr_code_text,
          transaction_id: data.id || data.transaction_id
        });
      }

      return res.status(401).json({ error: "Erro Dice", detail: data });

    } catch (error) {
      return res.status(500).json({ error: "Erro interno", msg: error.message });
    }
  }
}
