import { AppError } from "../Errors/AppError";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAuth0Token(): Promise<string|null|undefined> {
  const now = Date.now();

  
  if (cachedToken && now < tokenExpiry - 60 * 1000) {
    return cachedToken;
  }


 
  try {
      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          "client_id":process.env.AUTH0_CLIENT_ID,
          "client_secret":process.env.AUTH0_CLIENT_SECRET,
          "audience":`https://${process.env.AUTH0_DOMAIN}/api/v2/`,
          "grant_type":"client_credentials"
        }),
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.access_token
  } catch (err:any) {
    const { statusCode,message} = err;
    if(statusCode && (statusCode>=400 || statusCode<500)){
      throw new AppError(message,statusCode)
    }
    else{
      throw new AppError("Internal server error",500)
      
    }

      
  }


 
}



