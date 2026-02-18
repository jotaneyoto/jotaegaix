export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // COLOQUE AS DUAS AQUI
  const SECRET_KEY = "dicesk_live_bc38aad5a43f54cccdcac5c7681703a8ba849d809bf83700";
  const PUBLIC_KEY = "dice_live_e99fc6fa166def97f446fb67775d224a"; // Seu outro token

  if (req.method === "POST") {
    try {
      const { amount, buyerName } = req.body;
      const randomId = Date.now();

      const bodyDice = {
        product_name: "Pacote de Titulos",
        amount: parseFloat(amount),
        payer: {
          name: buyerName || "Cliente",
          email: `venda.${randomId}@gmail.com`,
          document: "12345678909" 
        }
      };

      // Tentando enviar a Secreta no Authorization e a Pública no Body 
      // (Algumas APIs da Dice pedem a pública para identificar a loja)
      const response = await fetch("https://api.use-dice.com/api/v2/payments/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SECRET_KEY}`,
          "x-public-key": PUBLIC_KEY // Tentativa de cabeçalho extra
        },
        body: JSON.stringify({
            ...bodyDice,
            api_key: PUBLIC_KEY // Tentativa de enviar no corpo também
        })
      });

      const data = await response.json();
      console.log("Resposta detalhada da Dice:", JSON.stringify(data));

      if (data.qr_code_text) {
        return res.status(200).json({
          qr_code_text: data.qr_code_text,
          transaction_id: data.id
        });
      }

      // Se falhar, o log na Vercel vai mostrar o erro exato agora
      return res.status(401).json({ error: "Erro de Credenciais", detail: data });

    } catch (error) {
      return res.status(500).json({ error: "Erro interno", msg: error.message });
    }
  }
}
