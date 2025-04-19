import type { Schema, Struct } from '@strapi/strapi';

export interface ProductAlternatingContent extends Struct.ComponentSchema {
  collectionName: 'components_product_alternating_contents';
  info: {
    description: '';
    displayName: 'Alternating Content';
  };
  attributes: {
    Image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Text: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.alternating-content': ProductAlternatingContent;
    }
  }
}
