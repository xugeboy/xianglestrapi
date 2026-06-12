import type { Schema, Struct } from '@strapi/strapi';

export interface CategoryApplicationCard extends Struct.ComponentSchema {
  collectionName: 'components_category_application_cards';
  info: {
    displayName: 'application-card';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    text: Schema.Attribute.String;
  };
}

export interface CategoryCategoryHero extends Struct.ComponentSchema {
  collectionName: 'components_category_category_heroes';
  info: {
    displayName: 'category-hero';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface CategoryFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_category_faq_items';
  info: {
    displayName: 'faq-item';
  };
  attributes: {
    answer: Schema.Attribute.Text;
    question: Schema.Attribute.String;
  };
}

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
      'category.application-card': CategoryApplicationCard;
      'category.category-hero': CategoryCategoryHero;
      'category.faq-item': CategoryFaqItem;
      'product.alternating-content': ProductAlternatingContent;
    }
  }
}
