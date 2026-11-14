import { useCallback, useRef, useState } from "react";
import {
  createIdempotentSubmitter,
  IdempotentSubmitResult,
  IdempotentSubmitter,
} from "@/lib/helpers/idempotency.helper";

/**
 * Version React de `createIdempotentSubmitter` : la clé vit tant que l'écran est monté,
 * `isSubmitting` sert à désactiver le bouton pendant la requête.
 */
export const useIdempotentSubmit = <P, R>(
  send: (payload: P, idempotencyKey: string) => Promise<R>,
) => {
  const sendRef = useRef(send);
  sendRef.current = send;
  const submitterRef = useRef<IdempotentSubmitter<P, R>>();
  if (!submitterRef.current) {
    submitterRef.current = createIdempotentSubmitter<P, R>({
      send: (payload, key) => sendRef.current(payload, key),
    });
  }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (payload: P): Promise<IdempotentSubmitResult<R>> => {
    const submitter = submitterRef.current!;
    if (submitter.isSubmitting()) return { status: "ignored" };
    setIsSubmitting(true);
    try {
      return await submitter.submit(payload);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => submitterRef.current!.reset(), []);

  return { submit, isSubmitting, reset };
};
