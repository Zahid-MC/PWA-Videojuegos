/** Clave pública: puede estar en el código. La privada solo vive en el servidor. */
export const VAPID_PUBLIC_KEY =
  'BKF3J461WSGMOJ6dZlHoa-J-67q1TPWYKSnBGlMF6BFV2mAB9wzNjTVnJxHfq3l_8Y2pcVKYKfvqaKiVHo6LZ2o';

/** Al desplegar el servidor, escribe aquí su URL: 'https://tu-servidor.onrender.com/api'. */
const PRODUCTION_PUSH_API_URL = '';

const isLocal = ['localhost', '127.0.0.1'].includes(location.hostname);

export const PUSH_API_URL = isLocal ? 'http://localhost:3000/api' : PRODUCTION_PUSH_API_URL;
