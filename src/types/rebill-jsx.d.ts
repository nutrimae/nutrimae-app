import type { DetailedHTMLProps, HTMLAttributes } from "react";

type RebillCheckoutProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  "public-key"?: string;
  "instant-product"?: string;
  "product-id"?: string;
  "plan-id"?: string;
  language?: string;
  display?: string;
  css?: string;
  "customer-information"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "rebill-checkout": RebillCheckoutProps;
    }
  }
}

export {};
