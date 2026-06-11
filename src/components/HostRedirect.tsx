import { useEffect } from "react";

const ROOT_HOST = "sistemamvbroker.com.br";
const WWW_HOST = "www.sistemamvbroker.com.br";
const APP_HOST = "app.sistemamvbroker.com.br";

/**
 * Faz redirects baseados no host:
 * - www.sistemamvbroker.com.br -> sistemamvbroker.com.br (mesmo path)
 * - app.sistemamvbroker.com.br/ -> app.sistemamvbroker.com.br/auth
 * - sistemamvbroker.com.br/<qualquer path != "/"> -> app.sistemamvbroker.com.br/<path>
 *
 * Só roda em produção (quando o host bate exatamente com um dos 3).
 */
export function HostRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { host, pathname, search, hash } = window.location;

    // 1) www -> raiz
    if (host === WWW_HOST) {
      window.location.replace(`https://${ROOT_HOST}${pathname}${search}${hash}`);
      return;
    }

    // 2) app/ exato -> app/auth
    if (host === APP_HOST && pathname === "/") {
      window.location.replace(`https://${APP_HOST}/auth${search}${hash}`);
      return;
    }

    // 3) raiz com path != "/" -> app + mesmo path
    if (host === ROOT_HOST && pathname !== "/") {
      window.location.replace(`https://${APP_HOST}${pathname}${search}${hash}`);
      return;
    }
  }, []);

  return null;
}
