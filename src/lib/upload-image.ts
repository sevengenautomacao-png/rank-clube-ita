const WEBHOOK_URL = 'https://n8n.diegoukan.com/webhook-test/9f1c3b2e-6a74-4a8f-b9c1-2d7e5f0a8c44';

export async function uploadImageToWebhook(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64,
            name: file.name,
            mimetype: file.type,
          }),
        });

        if (!response.ok) {
          reject(new Error(`Webhook error: ${response.status} ${response.statusText}`));
          return;
        }

        const data = await response.json();

        if (!data.imageUrl) {
          reject(new Error('Webhook did not return an imageUrl'));
          return;
        }

        resolve(data.imageUrl as string);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem.'));
    reader.readAsDataURL(file);
  });
}
