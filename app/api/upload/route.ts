import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen o el formato no es válido' },
        { status: 400 }
      );
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: IMGBB_API_KEY no está configurada en las variables de entorno");
      return NextResponse.json(
        { error: 'El servicio de carga de imágenes no está configurado en el servidor (IMGBB_API_KEY faltante)' },
        { status: 500 }
      );
    }

    // Convertir el archivo a un Buffer y luego a string Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Construir el cuerpo codificado para ImgBB
    const body = new URLSearchParams();
    body.append('image', base64Image);

    const apiRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error('Error response de ImgBB:', errorText);
      return NextResponse.json(
        { error: 'Fallo al conectar con el servidor de hosting de imágenes (ImgBB)' },
        { status: apiRes.status }
      );
    }

    const apiData = await apiRes.json();
    if (!apiData.success) {
      console.error('Error detallado de ImgBB:', apiData.error);
      return NextResponse.json(
        { error: apiData.error?.message || 'Error devuelto por la API de ImgBB' },
        { status: 400 }
      );
    }

    // Devolver la URL pública directa de la imagen cargada
    return NextResponse.json({ url: apiData.data.url });
  } catch (error: any) {
    console.error('Error interno en ruta API /api/upload:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
