export type GA4Event =
  | {
      name: "view_item";
      params: {
        item_id: string;
        item_name: string;
        value: number;
        currency: "BDT";
      };
    }
  | {
      name: "add_to_cart";
      params: {
        item_id: string;
        item_name: string;
        quantity: number;
        value: number;
        currency: "BDT";
      };
    }
  | {
      name: "remove_from_cart";
      params: {
        item_id: string;
        item_name: string;
        quantity: number;
        value: number;
        currency: "BDT";
      };
    }
  | {
      name: "begin_checkout";
      params: {
        value: number;
        currency: "BDT";
        items: {
          item_id: string;
          item_name: string;
          quantity: number;
          price: number;
        }[];
      };
    }
  | {
      name: "purchase";
      params: {
        transaction_id: string;
        value: number;
        currency: "BDT";
        items: {
          item_id: string;
          item_name: string;
          quantity: number;
          price: number;
        }[];
      };
    };
