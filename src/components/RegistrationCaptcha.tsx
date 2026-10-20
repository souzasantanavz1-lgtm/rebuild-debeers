import { useEffect, useRef, useState } from "react";

interface RecaptchaApi {
  render: (container: HTMLElement, options: {
    sitekey: string;
    size: "compact";
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => number;
  reset: (id: number) => void;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
    deBeersCaptchaReady?: () => void;
  }
}

export interface RegistrationCaptchaProps {
  onToken: (token: string) => void;
  resetVersion: number;
}

// Public site key: the corresponding secret is stored only in Lovable Cloud.
const SITE_KEY = "6LeTKfQtAAAAADcbcEDqiPe_HUmwIVpvzaBj0tx0";
let captchaLoader: Promise<void> | undefined;

function loadCaptcha(): Promise<void> {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (captchaLoader) return captchaLoader;
  captchaLoader = new Promise<void>((resolve, reject) => {
    window.deBeersCaptchaReady = resolve;
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?onload=deBeersCaptchaReady&render=explicit&hl=pt-BR";
    script.async = true;
    script.defer = true;
    script.onerror = () => { captchaLoader = undefined; reject(new Error("Captcha unavailable")); };
    document.head.appendChild(script);
  });
  return captchaLoader;
}

export function RegistrationCaptcha({ onToken, resetVersion }: RegistrationCaptchaProps) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<number>();
  const tokenCallback = useRef(onToken);
  tokenCallback.current = onToken;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCaptcha().then(() => {
      if (cancelled || !container.current || !window.grecaptcha || widget.current !== undefined) return;
      tokenCallback.current("");
      widget.current = window.grecaptcha.render(container.current, {
        sitekey: SITE_KEY,
        size: "compact",
        callback: (token) => { setFailed(false); tokenCallback.current(token); },
        "expired-callback": () => tokenCallback.current(""),
        "error-callback": () => { setFailed(true); tokenCallback.current(""); },
      });
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (widget.current !== undefined) window.grecaptcha?.reset(widget.current);
  }, [resetVersion]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={container} className="min-h-[144px] w-[164px]" />
      {failed && <p role="alert" className="text-sm text-destructive">Não foi possível carregar a verificação. Atualize a página.</p>}
    </div>
  );
}