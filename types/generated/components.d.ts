import type { Schema, Struct } from '@strapi/strapi';

export interface ProductAlternatingContent extends Struct.ComponentSchema {
  collectionName: 'components_product_alternating_contents';
  info: {
    displayName: 'alternating_content';
    icon: 'cast';
  };
  attributes: {
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    text: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.alternating-content': ProductAlternatingContent;
    }
  }
}
