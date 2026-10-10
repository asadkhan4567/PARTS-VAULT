import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_timeline_status" AS ENUM('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('unpaid', 'awaiting', 'paid', 'refunded', 'failed');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('cod', 'bank_transfer', 'jazzcash', 'easypaisa', 'card');
  CREATE TYPE "public"."enum_customers_type" AS ENUM('retail', 'workshop');
  CREATE TYPE "public"."enum_part_requests_status" AS ENUM('new', 'contacted', 'quoted', 'won', 'closed');
  CREATE TYPE "public"."enum_products_condition" AS ENUM('genuine', 'oem', 'aftermarket');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_condition" AS ENUM('genuine', 'oem', 'aftermarket');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categories_icon" AS ENUM('engine', 'car-front', 'lightbulb', 'disc', 'wrench', 'filter', 'droplet', 'snowflake', 'battery', 'sparkles', 'cog');
  CREATE TYPE "public"."enum_banners_placement" AS ENUM('home_hero', 'home_promo', 'home_feature', 'category_top', 'cart');
  CREATE TYPE "public"."enum_banners_theme" AS ENUM('navy', 'red', 'light');
  CREATE TYPE "public"."enum_coupons_type" AS ENUM('percent', 'fixed', 'free_delivery');
  CREATE TYPE "public"."enum_stock_alerts_type" AS ENUM('back_in_stock', 'price_drop');
  CREATE TYPE "public"."enum_pages_blocks_image_width" AS ENUM('content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_banner_style" AS ENUM('navy', 'red', 'light');
  CREATE TYPE "public"."enum_pages_blocks_product_grid_source" AS ENUM('manual', 'category', 'bestSellers', 'onSale');
  CREATE TYPE "public"."enum_pages_blocks_trust_strip_items_icon" AS ENUM('truck', 'shield-check', 'badge-percent', 'gift', 'wrench', 'clock', 'phone', 'star', 'package', 'map-pin');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_image_width" AS ENUM('content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_style" AS ENUM('navy', 'red', 'light');
  CREATE TYPE "public"."enum__pages_v_blocks_product_grid_source" AS ENUM('manual', 'category', 'bestSellers', 'onSale');
  CREATE TYPE "public"."enum__pages_v_blocks_trust_strip_items_icon" AS ENUM('truck', 'shield-check', 'badge-percent', 'gift', 'wrench', 'clock', 'phone', 'star', 'package', 'map-pin');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_blog_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__blog_posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'manager', 'staff');
  CREATE TYPE "public"."enum_audit_logs_action" AS ENUM('create', 'update', 'delete', 'bulk');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payment_settings_card_provider" AS ENUM('safepay', 'payfast');
  CREATE TYPE "public"."enum_navigation_footer_columns_auto" AS ENUM('none', 'makes', 'categories');
  CREATE TYPE "public"."enum_navigation_payment_icons" AS ENUM('cod', 'bank', 'jazzcash', 'easypaisa', 'visa', 'mastercard');
  CREATE TYPE "public"."enum_homepage_blocks_trust_strip_items_icon" AS ENUM('truck', 'shield-check', 'badge-percent', 'gift', 'wrench', 'clock', 'phone', 'star', 'package', 'map-pin');
  CREATE TYPE "public"."enum_homepage_blocks_shop_by_make_layout" AS ENUM('horizontal', 'grid');
  CREATE TYPE "public"."enum_homepage_blocks_product_tabs_tabs_source" AS ENUM('bestSellers', 'newArrivals', 'featured', 'onSale', 'category', 'manual');
  CREATE TYPE "public"."enum_homepage_blocks_banner_style" AS ENUM('navy', 'red', 'light');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_blocks_trust_strip_items_icon" AS ENUM('truck', 'shield-check', 'badge-percent', 'gift', 'wrench', 'clock', 'phone', 'star', 'package', 'map-pin');
  CREATE TYPE "public"."enum__homepage_v_blocks_shop_by_make_layout" AS ENUM('horizontal', 'grid');
  CREATE TYPE "public"."enum__homepage_v_blocks_product_tabs_tabs_source" AS ENUM('bestSellers', 'newArrivals', 'featured', 'onSale', 'category', 'manual');
  CREATE TYPE "public"."enum__homepage_v_blocks_banner_style" AS ENUM('navy', 'red', 'light');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"title" varchar NOT NULL,
  	"sku" varchar,
  	"unit_price" numeric NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"line_total" numeric
  );
  
  CREATE TABLE "orders_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" "enum_orders_timeline_status",
  	"at" timestamp(3) with time zone,
  	"by" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_number" varchar,
  	"status" "enum_orders_status" DEFAULT 'pending' NOT NULL,
  	"access_token" varchar,
  	"stock_restored" boolean DEFAULT false,
  	"points_credited" boolean DEFAULT false,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'unpaid' NOT NULL,
  	"customer_id" integer,
  	"customer_name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"city" varchar NOT NULL,
  	"area" varchar,
  	"address" varchar NOT NULL,
  	"vehicle" varchar,
  	"customer_note" varchar,
  	"rider_name" varchar,
  	"rider_phone" varchar,
  	"delivery_eta" varchar,
  	"subtotal" numeric,
  	"delivery_fee" numeric DEFAULT 0,
  	"cod_fee" numeric DEFAULT 0,
  	"coupon_code" varchar,
  	"discount" numeric DEFAULT 0,
  	"points_redeemed" numeric DEFAULT 0,
  	"points_used" numeric DEFAULT 0,
  	"total" numeric,
  	"points_earned" numeric DEFAULT 0,
  	"payment_method" "enum_orders_payment_method" DEFAULT 'cod' NOT NULL,
  	"payment_reference" varchar,
  	"payment_proof_id" integer,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers_addresses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"city" varchar NOT NULL,
  	"area" varchar,
  	"address" varchar NOT NULL
  );
  
  CREATE TABLE "customers_garage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"make_id" integer NOT NULL,
  	"model_id" integer NOT NULL,
  	"year" numeric NOT NULL
  );
  
  CREATE TABLE "customers_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"type" "enum_customers_type" DEFAULT 'retail',
  	"points" numeric DEFAULT 0,
  	"workshop_application" varchar,
  	"workshop_requested_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "customers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "part_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"vehicle" varchar,
  	"vin" varchar,
  	"part_name" varchar,
  	"message" varchar,
  	"photo_id" integer,
  	"status" "enum_part_requests_status" DEFAULT 'new',
  	"staff_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_cross_refs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"brand" varchar
  );
  
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_fitments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"make_id" integer,
  	"model_id" integer,
  	"year_from" numeric,
  	"year_to" numeric,
  	"engine" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"price" numeric,
  	"compare_at_price" numeric,
  	"workshop_price" numeric,
  	"cost_price" numeric,
  	"stock" numeric DEFAULT 0,
  	"low_stock_threshold" numeric DEFAULT 3,
  	"weight_kg" numeric,
  	"sku" varchar,
  	"oem_number" varchar,
  	"part_brand_id" integer,
  	"condition" "enum_products_condition" DEFAULT 'genuine',
  	"description" jsonb,
  	"warranty" varchar,
  	"video_url" varchar,
  	"universal_fit" boolean DEFAULT false,
  	"bundle_discount_percent" numeric DEFAULT 5,
  	"featured" boolean DEFAULT false,
  	"best_seller" boolean DEFAULT false,
  	"sales_count" numeric DEFAULT 0,
  	"rating_avg" numeric DEFAULT 0,
  	"rating_count" numeric DEFAULT 0,
  	"slug" varchar,
  	"search_text" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"categories_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_products_v_version_cross_refs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"brand" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_fitments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"make_id" integer,
  	"model_id" integer,
  	"year_from" numeric,
  	"year_to" numeric,
  	"engine" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_price" numeric,
  	"version_compare_at_price" numeric,
  	"version_workshop_price" numeric,
  	"version_cost_price" numeric,
  	"version_stock" numeric DEFAULT 0,
  	"version_low_stock_threshold" numeric DEFAULT 3,
  	"version_weight_kg" numeric,
  	"version_sku" varchar,
  	"version_oem_number" varchar,
  	"version_part_brand_id" integer,
  	"version_condition" "enum__products_v_version_condition" DEFAULT 'genuine',
  	"version_description" jsonb,
  	"version_warranty" varchar,
  	"version_video_url" varchar,
  	"version_universal_fit" boolean DEFAULT false,
  	"version_bundle_discount_percent" numeric DEFAULT 5,
  	"version_featured" boolean DEFAULT false,
  	"version_best_seller" boolean DEFAULT false,
  	"version_sales_count" numeric DEFAULT 0,
  	"version_rating_avg" numeric DEFAULT 0,
  	"version_rating_count" numeric DEFAULT 0,
  	"version_slug" varchar,
  	"version_search_text" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"categories_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"parent_id" integer,
  	"image_id" integer,
  	"icon" "enum_categories_icon" DEFAULT 'wrench',
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"show_on_home" boolean DEFAULT false,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "makes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"visible" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"make_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"year_from" numeric NOT NULL,
  	"year_to" numeric,
  	"image_id" integer,
  	"label" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "part_brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"logo_id" integer,
  	"country" varchar,
  	"trusted" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "banners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"placement" "enum_banners_placement" DEFAULT 'home_promo' NOT NULL,
  	"image_desktop_id" integer,
  	"image_mobile_id" integer,
  	"eyebrow" varchar,
  	"headline" varchar,
  	"subtext" varchar,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"theme" "enum_banners_theme" DEFAULT 'navy',
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coupons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"type" "enum_coupons_type" DEFAULT 'percent' NOT NULL,
  	"value" numeric,
  	"max_discount" numeric,
  	"min_order" numeric DEFAULT 0,
  	"usage_limit" numeric,
  	"used_count" numeric DEFAULT 0,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"first_order_only" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"customer_id" integer,
  	"name" varchar NOT NULL,
  	"city" varchar,
  	"rating" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"verified_buyer" boolean DEFAULT false,
  	"approved" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"source" varchar DEFAULT 'footer',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stock_alerts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"type" "enum_stock_alerts_type" DEFAULT 'back_in_stock' NOT NULL,
  	"contact" varchar NOT NULL,
  	"price_at_request" numeric,
  	"notified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"image_id" integer,
  	"caption" varchar,
  	"width" "enum_pages_blocks_image_width" DEFAULT 'content',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Frequently Asked Questions',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"banner_id" integer,
  	"headline" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"style" "enum_pages_blocks_banner_style" DEFAULT 'navy',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_product_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar,
  	"source" "enum_pages_blocks_product_grid_source" DEFAULT 'manual',
  	"category_id" integer,
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"url" varchar,
  	"file_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar,
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_url" varchar,
  	"secondary_label" varchar,
  	"secondary_url" varchar,
  	"whatsapp" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Get in touch',
  	"show_form" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_part_request" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Can''t find your part?',
  	"text" varchar DEFAULT 'Send a photo of the part or your VIN on WhatsApp — our experts reply within minutes.',
  	"button_label" varchar DEFAULT 'Send on WhatsApp',
  	"show_form" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_trust_strip_items_icon" DEFAULT 'truck',
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"prefix" varchar,
  	"suffix" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"image_id" integer,
  	"caption" varchar,
  	"width" "enum__pages_v_blocks_image_width" DEFAULT 'content',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Frequently Asked Questions',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"banner_id" integer,
  	"headline" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"style" "enum__pages_v_blocks_banner_style" DEFAULT 'navy',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar,
  	"source" "enum__pages_v_blocks_product_grid_source" DEFAULT 'manual',
  	"category_id" integer,
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"url" varchar,
  	"file_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar,
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_url" varchar,
  	"secondary_label" varchar,
  	"secondary_url" varchar,
  	"whatsapp" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Get in touch',
  	"show_form" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_part_request" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Can''t find your part?',
  	"text" varchar DEFAULT 'Send a photo of the part or your VIN on WhatsApp — our experts reply within minutes.',
  	"button_label" varchar DEFAULT 'Send on WhatsApp',
  	"show_form" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_trust_strip_items_icon" DEFAULT 'truck',
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"prefix" varchar,
  	"suffix" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"cover_id" integer,
  	"excerpt" varchar,
  	"body" jsonb,
  	"author" varchar DEFAULT 'Partsyaar Team',
  	"published_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_blog_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "blog_posts_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "blog_posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_blog_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_cover_id" integer,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_author" varchar DEFAULT 'Partsyaar Team',
  	"version_published_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__blog_posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_blog_posts_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_blog_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_banner_url" varchar,
  	"sizes_banner_width" numeric,
  	"sizes_banner_height" numeric,
  	"sizes_banner_mime_type" varchar,
  	"sizes_banner_filesize" numeric,
  	"sizes_banner_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'staff' NOT NULL,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" "enum_audit_logs_action",
  	"collection_slug" varchar,
  	"document_id" varchar,
  	"document_title" varchar,
  	"user_id" integer,
  	"user_label" varchar,
  	"changes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"orders_id" integer,
  	"customers_id" integer,
  	"part_requests_id" integer,
  	"products_id" integer,
  	"categories_id" integer,
  	"makes_id" integer,
  	"models_id" integer,
  	"part_brands_id" integer,
  	"banners_id" integer,
  	"coupons_id" integer,
  	"reviews_id" integer,
  	"subscribers_id" integer,
  	"stock_alerts_id" integer,
  	"pages_id" integer,
  	"blog_posts_id" integer,
  	"media_id" integer,
  	"users_id" integer,
  	"audit_logs_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"customers_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar DEFAULT 'Support',
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_stores" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"city" varchar DEFAULT 'Lahore',
  	"phone" varchar,
  	"hours" varchar,
  	"map_url" varchar,
  	"map_embed_query" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"store_name" varchar DEFAULT 'Partsyaar.com' NOT NULL,
  	"tagline" varchar DEFAULT 'Genuine Parts. Locked In. Delivered Fast.',
  	"logo_id" integer,
  	"logo_light_id" integer,
  	"about_blurb" varchar,
  	"footer_text" varchar DEFAULT '© Partsyaar.com. All rights reserved.',
  	"ntn" varchar,
  	"strn" varchar,
  	"phone" varchar DEFAULT '0300-0000000' NOT NULL,
  	"whatsapp" varchar DEFAULT '923000000000' NOT NULL,
  	"business_hours" varchar DEFAULT 'Mon–Sat 9:00am – 9:00pm · Sun 11:00am – 6:00pm',
  	"social_facebook" varchar,
  	"social_instagram" varchar,
  	"social_tiktok" varchar,
  	"social_youtube" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "delivery_settings_zones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar NOT NULL,
  	"fee" numeric NOT NULL,
  	"eta" varchar NOT NULL,
  	"same_day" boolean DEFAULT false
  );
  
  CREATE TABLE "delivery_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"same_day_enabled" boolean DEFAULT true,
  	"same_day_cutoff" varchar DEFAULT '17:00',
  	"free_delivery_threshold" numeric DEFAULT 10000,
  	"default_fee" numeric DEFAULT 350,
  	"default_eta" varchar DEFAULT '2–4 working days',
  	"cod_enabled" boolean DEFAULT true,
  	"cod_fee" numeric DEFAULT 0,
  	"shipping_summary" varchar,
  	"returns_summary" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "delivery_settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payment_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cod_enabled" boolean DEFAULT true,
  	"cod_instructions" varchar DEFAULT 'Pay the rider in cash when your parts arrive.',
  	"bank_transfer_enabled" boolean DEFAULT true,
  	"bank_transfer_details" varchar DEFAULT 'Bank: Meezan Bank
  Account title: Partsyaar
  IBAN: PK00 MEZN 0000 0000 0000 0000',
  	"jazzcash_enabled" boolean DEFAULT false,
  	"jazzcash_sandbox" boolean DEFAULT true,
  	"jazzcash_merchant_id" varchar,
  	"jazzcash_password" varchar,
  	"jazzcash_integrity_salt" varchar,
  	"easypaisa_enabled" boolean DEFAULT false,
  	"easypaisa_sandbox" boolean DEFAULT true,
  	"easypaisa_store_id" varchar,
  	"easypaisa_hash_key" varchar,
  	"card_enabled" boolean DEFAULT false,
  	"card_provider" "enum_payment_settings_card_provider" DEFAULT 'safepay',
  	"card_sandbox" boolean DEFAULT true,
  	"card_public_key" varchar,
  	"card_secret_key" varchar,
  	"card_webhook_secret" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"auto" "enum_navigation_footer_columns_auto" DEFAULT 'none'
  );
  
  CREATE TABLE "navigation_payment_icons" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_navigation_payment_icons",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"mega_menu_category_count" numeric DEFAULT 10,
  	"mega_menu_make_count" numeric DEFAULT 16,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_defaults" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title_template" varchar DEFAULT '%s | Partsyaar.com',
  	"default_title" varchar DEFAULT 'Partsyaar.com — Genuine Car Parts, Delivered Fast',
  	"default_description" varchar DEFAULT 'Genuine OEM and premium aftermarket car parts in Pakistan. Same-day delivery in Lahore.',
  	"og_image_id" integer,
  	"ga4_id" varchar,
  	"meta_pixel_id" varchar,
  	"google_verification" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"eyebrow" varchar DEFAULT 'Over 5,000 genuine parts in stock',
  	"headline" varchar DEFAULT 'Genuine Parts. Locked In. Delivered Fast.',
  	"highlight" varchar DEFAULT 'Locked In.',
  	"subheadline" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_url" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_url" varchar,
  	"background_image_id" integer,
  	"background_video_id" integer,
  	"show3d" boolean DEFAULT true,
  	"show_finder" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_homepage_blocks_trust_strip_items_icon" DEFAULT 'truck',
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "homepage_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"prefix" varchar,
  	"suffix" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "homepage_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_shop_by_make" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Shop by Make',
  	"subheading" varchar,
  	"layout" "enum_homepage_blocks_shop_by_make_layout" DEFAULT 'horizontal',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_promo_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_popular_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Popular Categories',
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_feature_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_deal_of_the_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Deal of the Day',
  	"product_id" integer,
  	"ends_at" timestamp(3) with time zone,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_product_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"source" "enum_homepage_blocks_product_tabs_tabs_source" DEFAULT 'bestSellers',
  	"limit" numeric DEFAULT 10,
  	"category_id" integer
  );
  
  CREATE TABLE "homepage_blocks_product_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Top Picks',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_delivery_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Order before the cutoff — get it today',
  	"text" varchar DEFAULT 'Our riders cover Lahore in under 60 minutes for in-stock parts.',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_brand_marquee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Brands We Trust',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_part_request" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Can''t find your part?',
  	"text" varchar DEFAULT 'Send a photo of the part or your VIN on WhatsApp — our experts reply within minutes.',
  	"button_label" varchar DEFAULT 'Send on WhatsApp',
  	"show_form" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'What Our Customers Say',
  	"limit" numeric DEFAULT 8,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_blog_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Maintenance Tips',
  	"limit" numeric DEFAULT 3,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Get 10% off your first order',
  	"text" varchar DEFAULT 'Join for deals, new arrivals and car-care tips. No spam.',
  	"coupon_code" varchar DEFAULT 'YAAR10',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"banner_id" integer,
  	"headline" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"style" "enum_homepage_blocks_banner_style" DEFAULT 'navy',
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar,
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_url" varchar,
  	"secondary_label" varchar,
  	"secondary_url" varchar,
  	"whatsapp" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"makes_id" integer,
  	"banners_id" integer,
  	"categories_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_homepage_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"eyebrow" varchar DEFAULT 'Over 5,000 genuine parts in stock',
  	"headline" varchar DEFAULT 'Genuine Parts. Locked In. Delivered Fast.',
  	"highlight" varchar DEFAULT 'Locked In.',
  	"subheadline" varchar,
  	"primary_cta_label" varchar,
  	"primary_cta_url" varchar,
  	"secondary_cta_label" varchar,
  	"secondary_cta_url" varchar,
  	"background_image_id" integer,
  	"background_video_id" integer,
  	"show3d" boolean DEFAULT true,
  	"show_finder" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_trust_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__homepage_v_blocks_trust_strip_items_icon" DEFAULT 'truck',
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_trust_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"prefix" varchar,
  	"suffix" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_shop_by_make" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Shop by Make',
  	"subheading" varchar,
  	"layout" "enum__homepage_v_blocks_shop_by_make_layout" DEFAULT 'horizontal',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_promo_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_popular_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Popular Categories',
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_feature_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_deal_of_the_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Deal of the Day',
  	"product_id" integer,
  	"ends_at" timestamp(3) with time zone,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_product_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"source" "enum__homepage_v_blocks_product_tabs_tabs_source" DEFAULT 'bestSellers',
  	"limit" numeric DEFAULT 10,
  	"category_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_product_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Top Picks',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_delivery_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Order before the cutoff — get it today',
  	"text" varchar DEFAULT 'Our riders cover Lahore in under 60 minutes for in-stock parts.',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_brand_marquee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Brands We Trust',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_part_request" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Can''t find your part?',
  	"text" varchar DEFAULT 'Send a photo of the part or your VIN on WhatsApp — our experts reply within minutes.',
  	"button_label" varchar DEFAULT 'Send on WhatsApp',
  	"show_form" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'What Our Customers Say',
  	"limit" numeric DEFAULT 8,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_blog_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Maintenance Tips',
  	"limit" numeric DEFAULT 3,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar DEFAULT 'Get 10% off your first order',
  	"text" varchar DEFAULT 'Join for deals, new arrivals and car-care tips. No spam.',
  	"coupon_code" varchar DEFAULT 'YAAR10',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"banner_id" integer,
  	"headline" varchar,
  	"text" varchar,
  	"cta_label" varchar,
  	"cta_url" varchar,
  	"style" "enum__homepage_v_blocks_banner_style" DEFAULT 'navy',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"heading" varchar,
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_url" varchar,
  	"secondary_label" varchar,
  	"secondary_url" varchar,
  	"whatsapp" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"makes_id" integer,
  	"banners_id" integer,
  	"categories_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "announcement_bar_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"link" varchar
  );
  
  CREATE TABLE "announcement_bar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"background" varchar DEFAULT '#E10600',
  	"text_color" varchar DEFAULT '#FFFFFF',
  	"interval_seconds" numeric DEFAULT 4,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "popups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"title" varchar DEFAULT 'Get 10% off your first order',
  	"text" varchar DEFAULT 'Join our list for deals and car-care tips.',
  	"image_id" integer,
  	"delay_seconds" numeric DEFAULT 8,
  	"coupon_code" varchar DEFAULT 'YAAR10',
  	"collect_email" boolean DEFAULT true,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "loyalty_settings_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"min_points" numeric NOT NULL,
  	"multiplier" numeric DEFAULT 1
  );
  
  CREATE TABLE "loyalty_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"points_per100" numeric DEFAULT 1,
  	"point_value" numeric DEFAULT 1,
  	"min_redeem" numeric DEFAULT 100,
  	"max_redeem_percent" numeric DEFAULT 20,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_timeline" ADD CONSTRAINT "orders_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_proof_id_media_id_fk" FOREIGN KEY ("payment_proof_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customers_addresses" ADD CONSTRAINT "customers_addresses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_garage" ADD CONSTRAINT "customers_garage_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customers_garage" ADD CONSTRAINT "customers_garage_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "customers_garage" ADD CONSTRAINT "customers_garage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_sessions" ADD CONSTRAINT "customers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_rels" ADD CONSTRAINT "customers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "customers_rels" ADD CONSTRAINT "customers_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "part_requests" ADD CONSTRAINT "part_requests_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_cross_refs" ADD CONSTRAINT "products_cross_refs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_fitments" ADD CONSTRAINT "products_fitments_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_fitments" ADD CONSTRAINT "products_fitments_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_fitments" ADD CONSTRAINT "products_fitments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_part_brand_id_part_brands_id_fk" FOREIGN KEY ("part_brand_id") REFERENCES "public"."part_brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_cross_refs" ADD CONSTRAINT "_products_v_version_cross_refs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_fitments" ADD CONSTRAINT "_products_v_version_fitments_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_fitments" ADD CONSTRAINT "_products_v_version_fitments_model_id_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_fitments" ADD CONSTRAINT "_products_v_version_fitments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_part_brand_id_part_brands_id_fk" FOREIGN KEY ("version_part_brand_id") REFERENCES "public"."part_brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "makes" ADD CONSTRAINT "makes_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "models" ADD CONSTRAINT "models_make_id_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."makes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "models" ADD CONSTRAINT "models_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "part_brands" ADD CONSTRAINT "part_brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_image_desktop_id_media_id_fk" FOREIGN KEY ("image_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "banners" ADD CONSTRAINT "banners_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_rels" ADD CONSTRAINT "reviews_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_grid" ADD CONSTRAINT "pages_blocks_product_grid_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_grid" ADD CONSTRAINT "pages_blocks_product_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_video" ADD CONSTRAINT "pages_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact" ADD CONSTRAINT "pages_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_part_request" ADD CONSTRAINT "pages_blocks_part_request_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_strip_items" ADD CONSTRAINT "pages_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_strip" ADD CONSTRAINT "pages_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_items" ADD CONSTRAINT "pages_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats" ADD CONSTRAINT "pages_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_grid" ADD CONSTRAINT "_pages_v_blocks_product_grid_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_grid" ADD CONSTRAINT "_pages_v_blocks_product_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video" ADD CONSTRAINT "_pages_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact" ADD CONSTRAINT "_pages_v_blocks_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_part_request" ADD CONSTRAINT "_pages_v_blocks_part_request_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_strip_items" ADD CONSTRAINT "_pages_v_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_strip" ADD CONSTRAINT "_pages_v_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_items" ADD CONSTRAINT "_pages_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats" ADD CONSTRAINT "_pages_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts_texts" ADD CONSTRAINT "blog_posts_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_posts_rels" ADD CONSTRAINT "blog_posts_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_parent_id_blog_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v" ADD CONSTRAINT "_blog_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_blog_posts_v_texts" ADD CONSTRAINT "_blog_posts_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_posts_v_rels" ADD CONSTRAINT "_blog_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_blog_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_blog_posts_v_rels" ADD CONSTRAINT "_blog_posts_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_part_requests_fk" FOREIGN KEY ("part_requests_id") REFERENCES "public"."part_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_makes_fk" FOREIGN KEY ("makes_id") REFERENCES "public"."makes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_models_fk" FOREIGN KEY ("models_id") REFERENCES "public"."models"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_part_brands_fk" FOREIGN KEY ("part_brands_id") REFERENCES "public"."part_brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stock_alerts_fk" FOREIGN KEY ("stock_alerts_id") REFERENCES "public"."stock_alerts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_emails" ADD CONSTRAINT "site_settings_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_stores" ADD CONSTRAINT "site_settings_stores_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_light_id_media_id_fk" FOREIGN KEY ("logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_texts" ADD CONSTRAINT "site_settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "delivery_settings_zones" ADD CONSTRAINT "delivery_settings_zones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."delivery_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "delivery_settings_texts" ADD CONSTRAINT "delivery_settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."delivery_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_links" ADD CONSTRAINT "navigation_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_payment_icons" ADD CONSTRAINT "navigation_payment_icons_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_defaults" ADD CONSTRAINT "seo_defaults_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_trust_strip_items" ADD CONSTRAINT "homepage_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_trust_strip" ADD CONSTRAINT "homepage_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_stats_items" ADD CONSTRAINT "homepage_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_stats" ADD CONSTRAINT "homepage_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_shop_by_make" ADD CONSTRAINT "homepage_blocks_shop_by_make_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_promo_banners" ADD CONSTRAINT "homepage_blocks_promo_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_popular_categories" ADD CONSTRAINT "homepage_blocks_popular_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_feature_banners" ADD CONSTRAINT "homepage_blocks_feature_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_deal_of_the_day" ADD CONSTRAINT "homepage_blocks_deal_of_the_day_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_deal_of_the_day" ADD CONSTRAINT "homepage_blocks_deal_of_the_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_tabs_tabs" ADD CONSTRAINT "homepage_blocks_product_tabs_tabs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_tabs_tabs" ADD CONSTRAINT "homepage_blocks_product_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_blocks_product_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_product_tabs" ADD CONSTRAINT "homepage_blocks_product_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_delivery_strip" ADD CONSTRAINT "homepage_blocks_delivery_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_brand_marquee" ADD CONSTRAINT "homepage_blocks_brand_marquee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_part_request" ADD CONSTRAINT "homepage_blocks_part_request_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_reviews" ADD CONSTRAINT "homepage_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_blog_teaser" ADD CONSTRAINT "homepage_blocks_blog_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_newsletter" ADD CONSTRAINT "homepage_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_banner" ADD CONSTRAINT "homepage_blocks_banner_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_banner" ADD CONSTRAINT "homepage_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_rich_text" ADD CONSTRAINT "homepage_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_cta" ADD CONSTRAINT "homepage_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_makes_fk" FOREIGN KEY ("makes_id") REFERENCES "public"."makes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_background_video_id_media_id_fk" FOREIGN KEY ("background_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_hero" ADD CONSTRAINT "_homepage_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_trust_strip_items" ADD CONSTRAINT "_homepage_v_blocks_trust_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_trust_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_trust_strip" ADD CONSTRAINT "_homepage_v_blocks_trust_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_stats_items" ADD CONSTRAINT "_homepage_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_stats" ADD CONSTRAINT "_homepage_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_shop_by_make" ADD CONSTRAINT "_homepage_v_blocks_shop_by_make_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_promo_banners" ADD CONSTRAINT "_homepage_v_blocks_promo_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_popular_categories" ADD CONSTRAINT "_homepage_v_blocks_popular_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_feature_banners" ADD CONSTRAINT "_homepage_v_blocks_feature_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_deal_of_the_day" ADD CONSTRAINT "_homepage_v_blocks_deal_of_the_day_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_deal_of_the_day" ADD CONSTRAINT "_homepage_v_blocks_deal_of_the_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_tabs_tabs" ADD CONSTRAINT "_homepage_v_blocks_product_tabs_tabs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_tabs_tabs" ADD CONSTRAINT "_homepage_v_blocks_product_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_blocks_product_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_product_tabs" ADD CONSTRAINT "_homepage_v_blocks_product_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_delivery_strip" ADD CONSTRAINT "_homepage_v_blocks_delivery_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_brand_marquee" ADD CONSTRAINT "_homepage_v_blocks_brand_marquee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_part_request" ADD CONSTRAINT "_homepage_v_blocks_part_request_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_reviews" ADD CONSTRAINT "_homepage_v_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_blog_teaser" ADD CONSTRAINT "_homepage_v_blocks_blog_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_newsletter" ADD CONSTRAINT "_homepage_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_banner" ADD CONSTRAINT "_homepage_v_blocks_banner_banner_id_banners_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."banners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_banner" ADD CONSTRAINT "_homepage_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_rich_text" ADD CONSTRAINT "_homepage_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_blocks_cta" ADD CONSTRAINT "_homepage_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_makes_fk" FOREIGN KEY ("makes_id") REFERENCES "public"."makes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_banners_fk" FOREIGN KEY ("banners_id") REFERENCES "public"."banners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "announcement_bar_messages" ADD CONSTRAINT "announcement_bar_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."announcement_bar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "popups" ADD CONSTRAINT "popups_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "loyalty_settings_tiers" ADD CONSTRAINT "loyalty_settings_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."loyalty_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_timeline_order_idx" ON "orders_timeline" USING btree ("_order");
  CREATE INDEX "orders_timeline_parent_id_idx" ON "orders_timeline" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "orders_phone_idx" ON "orders" USING btree ("phone");
  CREATE INDEX "orders_payment_proof_idx" ON "orders" USING btree ("payment_proof_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "customers_addresses_order_idx" ON "customers_addresses" USING btree ("_order");
  CREATE INDEX "customers_addresses_parent_id_idx" ON "customers_addresses" USING btree ("_parent_id");
  CREATE INDEX "customers_garage_order_idx" ON "customers_garage" USING btree ("_order");
  CREATE INDEX "customers_garage_parent_id_idx" ON "customers_garage" USING btree ("_parent_id");
  CREATE INDEX "customers_garage_make_idx" ON "customers_garage" USING btree ("make_id");
  CREATE INDEX "customers_garage_model_idx" ON "customers_garage" USING btree ("model_id");
  CREATE INDEX "customers_sessions_order_idx" ON "customers_sessions" USING btree ("_order");
  CREATE INDEX "customers_sessions_parent_id_idx" ON "customers_sessions" USING btree ("_parent_id");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  CREATE INDEX "customers_rels_order_idx" ON "customers_rels" USING btree ("order");
  CREATE INDEX "customers_rels_parent_idx" ON "customers_rels" USING btree ("parent_id");
  CREATE INDEX "customers_rels_path_idx" ON "customers_rels" USING btree ("path");
  CREATE INDEX "customers_rels_products_id_idx" ON "customers_rels" USING btree ("products_id");
  CREATE INDEX "part_requests_photo_idx" ON "part_requests" USING btree ("photo_id");
  CREATE INDEX "part_requests_updated_at_idx" ON "part_requests" USING btree ("updated_at");
  CREATE INDEX "part_requests_created_at_idx" ON "part_requests" USING btree ("created_at");
  CREATE INDEX "products_cross_refs_order_idx" ON "products_cross_refs" USING btree ("_order");
  CREATE INDEX "products_cross_refs_parent_id_idx" ON "products_cross_refs" USING btree ("_parent_id");
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_fitments_order_idx" ON "products_fitments" USING btree ("_order");
  CREATE INDEX "products_fitments_parent_id_idx" ON "products_fitments" USING btree ("_parent_id");
  CREATE INDEX "products_fitments_make_idx" ON "products_fitments" USING btree ("make_id");
  CREATE INDEX "products_fitments_model_idx" ON "products_fitments" USING btree ("model_id");
  CREATE UNIQUE INDEX "products_sku_idx" ON "products" USING btree ("sku");
  CREATE INDEX "products_oem_number_idx" ON "products" USING btree ("oem_number");
  CREATE INDEX "products_part_brand_idx" ON "products" USING btree ("part_brand_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_version_cross_refs_order_idx" ON "_products_v_version_cross_refs" USING btree ("_order");
  CREATE INDEX "_products_v_version_cross_refs_parent_id_idx" ON "_products_v_version_cross_refs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_fitments_order_idx" ON "_products_v_version_fitments" USING btree ("_order");
  CREATE INDEX "_products_v_version_fitments_parent_id_idx" ON "_products_v_version_fitments" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_fitments_make_idx" ON "_products_v_version_fitments" USING btree ("make_id");
  CREATE INDEX "_products_v_version_fitments_model_idx" ON "_products_v_version_fitments" USING btree ("model_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_sku_idx" ON "_products_v" USING btree ("version_sku");
  CREATE INDEX "_products_v_version_version_oem_number_idx" ON "_products_v" USING btree ("version_oem_number");
  CREATE INDEX "_products_v_version_version_part_brand_idx" ON "_products_v" USING btree ("version_part_brand_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "makes_logo_idx" ON "makes" USING btree ("logo_id");
  CREATE UNIQUE INDEX "makes_slug_idx" ON "makes" USING btree ("slug");
  CREATE INDEX "makes_updated_at_idx" ON "makes" USING btree ("updated_at");
  CREATE INDEX "makes_created_at_idx" ON "makes" USING btree ("created_at");
  CREATE INDEX "models_make_idx" ON "models" USING btree ("make_id");
  CREATE INDEX "models_image_idx" ON "models" USING btree ("image_id");
  CREATE INDEX "models_slug_idx" ON "models" USING btree ("slug");
  CREATE INDEX "models_updated_at_idx" ON "models" USING btree ("updated_at");
  CREATE INDEX "models_created_at_idx" ON "models" USING btree ("created_at");
  CREATE INDEX "part_brands_logo_idx" ON "part_brands" USING btree ("logo_id");
  CREATE UNIQUE INDEX "part_brands_slug_idx" ON "part_brands" USING btree ("slug");
  CREATE INDEX "part_brands_updated_at_idx" ON "part_brands" USING btree ("updated_at");
  CREATE INDEX "part_brands_created_at_idx" ON "part_brands" USING btree ("created_at");
  CREATE INDEX "banners_image_desktop_idx" ON "banners" USING btree ("image_desktop_id");
  CREATE INDEX "banners_image_mobile_idx" ON "banners" USING btree ("image_mobile_id");
  CREATE INDEX "banners_updated_at_idx" ON "banners" USING btree ("updated_at");
  CREATE INDEX "banners_created_at_idx" ON "banners" USING btree ("created_at");
  CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");
  CREATE INDEX "coupons_updated_at_idx" ON "coupons" USING btree ("updated_at");
  CREATE INDEX "coupons_created_at_idx" ON "coupons" USING btree ("created_at");
  CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");
  CREATE INDEX "reviews_customer_idx" ON "reviews" USING btree ("customer_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "reviews_rels_order_idx" ON "reviews_rels" USING btree ("order");
  CREATE INDEX "reviews_rels_parent_idx" ON "reviews_rels" USING btree ("parent_id");
  CREATE INDEX "reviews_rels_path_idx" ON "reviews_rels" USING btree ("path");
  CREATE INDEX "reviews_rels_media_id_idx" ON "reviews_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  CREATE INDEX "stock_alerts_product_idx" ON "stock_alerts" USING btree ("product_id");
  CREATE INDEX "stock_alerts_updated_at_idx" ON "stock_alerts" USING btree ("updated_at");
  CREATE INDEX "stock_alerts_created_at_idx" ON "stock_alerts" USING btree ("created_at");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_order_idx" ON "pages_blocks_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_parent_id_idx" ON "pages_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_path_idx" ON "pages_blocks_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_banner_idx" ON "pages_blocks_banner" USING btree ("banner_id");
  CREATE INDEX "pages_blocks_product_grid_order_idx" ON "pages_blocks_product_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_grid_parent_id_idx" ON "pages_blocks_product_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_grid_path_idx" ON "pages_blocks_product_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_grid_category_idx" ON "pages_blocks_product_grid" USING btree ("category_id");
  CREATE INDEX "pages_blocks_video_order_idx" ON "pages_blocks_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_parent_id_idx" ON "pages_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_path_idx" ON "pages_blocks_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_file_idx" ON "pages_blocks_video" USING btree ("file_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_order_idx" ON "pages_blocks_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_parent_id_idx" ON "pages_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_path_idx" ON "pages_blocks_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_part_request_order_idx" ON "pages_blocks_part_request" USING btree ("_order");
  CREATE INDEX "pages_blocks_part_request_parent_id_idx" ON "pages_blocks_part_request" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_part_request_path_idx" ON "pages_blocks_part_request" USING btree ("_path");
  CREATE INDEX "pages_blocks_trust_strip_items_order_idx" ON "pages_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_strip_items_parent_id_idx" ON "pages_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_strip_order_idx" ON "pages_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_strip_parent_id_idx" ON "pages_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_strip_path_idx" ON "pages_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_items_order_idx" ON "pages_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_items_parent_id_idx" ON "pages_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_order_idx" ON "pages_blocks_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_parent_id_idx" ON "pages_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_path_idx" ON "pages_blocks_stats" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_order_idx" ON "_pages_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_banner_parent_id_idx" ON "_pages_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_banner_path_idx" ON "_pages_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_banner_idx" ON "_pages_v_blocks_banner" USING btree ("banner_id");
  CREATE INDEX "_pages_v_blocks_product_grid_order_idx" ON "_pages_v_blocks_product_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_grid_parent_id_idx" ON "_pages_v_blocks_product_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_grid_path_idx" ON "_pages_v_blocks_product_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_grid_category_idx" ON "_pages_v_blocks_product_grid" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_video_order_idx" ON "_pages_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_parent_id_idx" ON "_pages_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_path_idx" ON "_pages_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_file_idx" ON "_pages_v_blocks_video" USING btree ("file_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_order_idx" ON "_pages_v_blocks_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_parent_id_idx" ON "_pages_v_blocks_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_path_idx" ON "_pages_v_blocks_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_part_request_order_idx" ON "_pages_v_blocks_part_request" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_part_request_parent_id_idx" ON "_pages_v_blocks_part_request" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_part_request_path_idx" ON "_pages_v_blocks_part_request" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_trust_strip_items_order_idx" ON "_pages_v_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_strip_items_parent_id_idx" ON "_pages_v_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_strip_order_idx" ON "_pages_v_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_strip_parent_id_idx" ON "_pages_v_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_strip_path_idx" ON "_pages_v_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_items_order_idx" ON "_pages_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_items_parent_id_idx" ON "_pages_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_order_idx" ON "_pages_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_parent_id_idx" ON "_pages_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_path_idx" ON "_pages_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");
  CREATE INDEX "blog_posts_cover_idx" ON "blog_posts" USING btree ("cover_id");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_meta_meta_image_idx" ON "blog_posts" USING btree ("meta_image_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE INDEX "blog_posts__status_idx" ON "blog_posts" USING btree ("_status");
  CREATE INDEX "blog_posts_texts_order_parent" ON "blog_posts_texts" USING btree ("order","parent_id");
  CREATE INDEX "blog_posts_rels_order_idx" ON "blog_posts_rels" USING btree ("order");
  CREATE INDEX "blog_posts_rels_parent_idx" ON "blog_posts_rels" USING btree ("parent_id");
  CREATE INDEX "blog_posts_rels_path_idx" ON "blog_posts_rels" USING btree ("path");
  CREATE INDEX "blog_posts_rels_products_id_idx" ON "blog_posts_rels" USING btree ("products_id");
  CREATE INDEX "_blog_posts_v_parent_idx" ON "_blog_posts_v" USING btree ("parent_id");
  CREATE INDEX "_blog_posts_v_version_version_cover_idx" ON "_blog_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_blog_posts_v_version_version_slug_idx" ON "_blog_posts_v" USING btree ("version_slug");
  CREATE INDEX "_blog_posts_v_version_meta_version_meta_image_idx" ON "_blog_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_blog_posts_v_version_version_updated_at_idx" ON "_blog_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_blog_posts_v_version_version_created_at_idx" ON "_blog_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_blog_posts_v_version_version__status_idx" ON "_blog_posts_v" USING btree ("version__status");
  CREATE INDEX "_blog_posts_v_created_at_idx" ON "_blog_posts_v" USING btree ("created_at");
  CREATE INDEX "_blog_posts_v_updated_at_idx" ON "_blog_posts_v" USING btree ("updated_at");
  CREATE INDEX "_blog_posts_v_latest_idx" ON "_blog_posts_v" USING btree ("latest");
  CREATE INDEX "_blog_posts_v_texts_order_parent" ON "_blog_posts_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_blog_posts_v_rels_order_idx" ON "_blog_posts_v_rels" USING btree ("order");
  CREATE INDEX "_blog_posts_v_rels_parent_idx" ON "_blog_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_blog_posts_v_rels_path_idx" ON "_blog_posts_v_rels" USING btree ("path");
  CREATE INDEX "_blog_posts_v_rels_products_id_idx" ON "_blog_posts_v_rels" USING btree ("products_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_banner_sizes_banner_filename_idx" ON "media" USING btree ("sizes_banner_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "audit_logs_collection_slug_idx" ON "audit_logs" USING btree ("collection_slug");
  CREATE INDEX "audit_logs_document_id_idx" ON "audit_logs" USING btree ("document_id");
  CREATE INDEX "audit_logs_user_idx" ON "audit_logs" USING btree ("user_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_part_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("part_requests_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_makes_id_idx" ON "payload_locked_documents_rels" USING btree ("makes_id");
  CREATE INDEX "payload_locked_documents_rels_models_id_idx" ON "payload_locked_documents_rels" USING btree ("models_id");
  CREATE INDEX "payload_locked_documents_rels_part_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("part_brands_id");
  CREATE INDEX "payload_locked_documents_rels_banners_id_idx" ON "payload_locked_documents_rels" USING btree ("banners_id");
  CREATE INDEX "payload_locked_documents_rels_coupons_id_idx" ON "payload_locked_documents_rels" USING btree ("coupons_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_stock_alerts_id_idx" ON "payload_locked_documents_rels" USING btree ("stock_alerts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_customers_id_idx" ON "payload_preferences_rels" USING btree ("customers_id");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_emails_order_idx" ON "site_settings_emails" USING btree ("_order");
  CREATE INDEX "site_settings_emails_parent_id_idx" ON "site_settings_emails" USING btree ("_parent_id");
  CREATE INDEX "site_settings_stores_order_idx" ON "site_settings_stores" USING btree ("_order");
  CREATE INDEX "site_settings_stores_parent_id_idx" ON "site_settings_stores" USING btree ("_parent_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_light_idx" ON "site_settings" USING btree ("logo_light_id");
  CREATE INDEX "site_settings_texts_order_parent" ON "site_settings_texts" USING btree ("order","parent_id");
  CREATE INDEX "delivery_settings_zones_order_idx" ON "delivery_settings_zones" USING btree ("_order");
  CREATE INDEX "delivery_settings_zones_parent_id_idx" ON "delivery_settings_zones" USING btree ("_parent_id");
  CREATE INDEX "delivery_settings_texts_order_parent" ON "delivery_settings_texts" USING btree ("order","parent_id");
  CREATE INDEX "navigation_header_links_order_idx" ON "navigation_header_links" USING btree ("_order");
  CREATE INDEX "navigation_header_links_parent_id_idx" ON "navigation_header_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "navigation_payment_icons_order_idx" ON "navigation_payment_icons" USING btree ("order");
  CREATE INDEX "navigation_payment_icons_parent_idx" ON "navigation_payment_icons" USING btree ("parent_id");
  CREATE INDEX "seo_defaults_og_image_idx" ON "seo_defaults" USING btree ("og_image_id");
  CREATE INDEX "homepage_blocks_hero_order_idx" ON "homepage_blocks_hero" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_parent_id_idx" ON "homepage_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_path_idx" ON "homepage_blocks_hero" USING btree ("_path");
  CREATE INDEX "homepage_blocks_hero_background_image_idx" ON "homepage_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "homepage_blocks_hero_background_video_idx" ON "homepage_blocks_hero" USING btree ("background_video_id");
  CREATE INDEX "homepage_blocks_trust_strip_items_order_idx" ON "homepage_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "homepage_blocks_trust_strip_items_parent_id_idx" ON "homepage_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_trust_strip_order_idx" ON "homepage_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "homepage_blocks_trust_strip_parent_id_idx" ON "homepage_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_trust_strip_path_idx" ON "homepage_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "homepage_blocks_stats_items_order_idx" ON "homepage_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "homepage_blocks_stats_items_parent_id_idx" ON "homepage_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_stats_order_idx" ON "homepage_blocks_stats" USING btree ("_order");
  CREATE INDEX "homepage_blocks_stats_parent_id_idx" ON "homepage_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_stats_path_idx" ON "homepage_blocks_stats" USING btree ("_path");
  CREATE INDEX "homepage_blocks_shop_by_make_order_idx" ON "homepage_blocks_shop_by_make" USING btree ("_order");
  CREATE INDEX "homepage_blocks_shop_by_make_parent_id_idx" ON "homepage_blocks_shop_by_make" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_shop_by_make_path_idx" ON "homepage_blocks_shop_by_make" USING btree ("_path");
  CREATE INDEX "homepage_blocks_promo_banners_order_idx" ON "homepage_blocks_promo_banners" USING btree ("_order");
  CREATE INDEX "homepage_blocks_promo_banners_parent_id_idx" ON "homepage_blocks_promo_banners" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_promo_banners_path_idx" ON "homepage_blocks_promo_banners" USING btree ("_path");
  CREATE INDEX "homepage_blocks_popular_categories_order_idx" ON "homepage_blocks_popular_categories" USING btree ("_order");
  CREATE INDEX "homepage_blocks_popular_categories_parent_id_idx" ON "homepage_blocks_popular_categories" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_popular_categories_path_idx" ON "homepage_blocks_popular_categories" USING btree ("_path");
  CREATE INDEX "homepage_blocks_feature_banners_order_idx" ON "homepage_blocks_feature_banners" USING btree ("_order");
  CREATE INDEX "homepage_blocks_feature_banners_parent_id_idx" ON "homepage_blocks_feature_banners" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_feature_banners_path_idx" ON "homepage_blocks_feature_banners" USING btree ("_path");
  CREATE INDEX "homepage_blocks_deal_of_the_day_order_idx" ON "homepage_blocks_deal_of_the_day" USING btree ("_order");
  CREATE INDEX "homepage_blocks_deal_of_the_day_parent_id_idx" ON "homepage_blocks_deal_of_the_day" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_deal_of_the_day_path_idx" ON "homepage_blocks_deal_of_the_day" USING btree ("_path");
  CREATE INDEX "homepage_blocks_deal_of_the_day_product_idx" ON "homepage_blocks_deal_of_the_day" USING btree ("product_id");
  CREATE INDEX "homepage_blocks_product_tabs_tabs_order_idx" ON "homepage_blocks_product_tabs_tabs" USING btree ("_order");
  CREATE INDEX "homepage_blocks_product_tabs_tabs_parent_id_idx" ON "homepage_blocks_product_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_product_tabs_tabs_category_idx" ON "homepage_blocks_product_tabs_tabs" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_product_tabs_order_idx" ON "homepage_blocks_product_tabs" USING btree ("_order");
  CREATE INDEX "homepage_blocks_product_tabs_parent_id_idx" ON "homepage_blocks_product_tabs" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_product_tabs_path_idx" ON "homepage_blocks_product_tabs" USING btree ("_path");
  CREATE INDEX "homepage_blocks_delivery_strip_order_idx" ON "homepage_blocks_delivery_strip" USING btree ("_order");
  CREATE INDEX "homepage_blocks_delivery_strip_parent_id_idx" ON "homepage_blocks_delivery_strip" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_delivery_strip_path_idx" ON "homepage_blocks_delivery_strip" USING btree ("_path");
  CREATE INDEX "homepage_blocks_brand_marquee_order_idx" ON "homepage_blocks_brand_marquee" USING btree ("_order");
  CREATE INDEX "homepage_blocks_brand_marquee_parent_id_idx" ON "homepage_blocks_brand_marquee" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_brand_marquee_path_idx" ON "homepage_blocks_brand_marquee" USING btree ("_path");
  CREATE INDEX "homepage_blocks_part_request_order_idx" ON "homepage_blocks_part_request" USING btree ("_order");
  CREATE INDEX "homepage_blocks_part_request_parent_id_idx" ON "homepage_blocks_part_request" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_part_request_path_idx" ON "homepage_blocks_part_request" USING btree ("_path");
  CREATE INDEX "homepage_blocks_reviews_order_idx" ON "homepage_blocks_reviews" USING btree ("_order");
  CREATE INDEX "homepage_blocks_reviews_parent_id_idx" ON "homepage_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_reviews_path_idx" ON "homepage_blocks_reviews" USING btree ("_path");
  CREATE INDEX "homepage_blocks_blog_teaser_order_idx" ON "homepage_blocks_blog_teaser" USING btree ("_order");
  CREATE INDEX "homepage_blocks_blog_teaser_parent_id_idx" ON "homepage_blocks_blog_teaser" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_blog_teaser_path_idx" ON "homepage_blocks_blog_teaser" USING btree ("_path");
  CREATE INDEX "homepage_blocks_newsletter_order_idx" ON "homepage_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "homepage_blocks_newsletter_parent_id_idx" ON "homepage_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_newsletter_path_idx" ON "homepage_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "homepage_blocks_banner_order_idx" ON "homepage_blocks_banner" USING btree ("_order");
  CREATE INDEX "homepage_blocks_banner_parent_id_idx" ON "homepage_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_banner_path_idx" ON "homepage_blocks_banner" USING btree ("_path");
  CREATE INDEX "homepage_blocks_banner_banner_idx" ON "homepage_blocks_banner" USING btree ("banner_id");
  CREATE INDEX "homepage_blocks_rich_text_order_idx" ON "homepage_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "homepage_blocks_rich_text_parent_id_idx" ON "homepage_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_rich_text_path_idx" ON "homepage_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "homepage_blocks_cta_order_idx" ON "homepage_blocks_cta" USING btree ("_order");
  CREATE INDEX "homepage_blocks_cta_parent_id_idx" ON "homepage_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_cta_path_idx" ON "homepage_blocks_cta" USING btree ("_path");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_makes_id_idx" ON "homepage_rels" USING btree ("makes_id");
  CREATE INDEX "homepage_rels_banners_id_idx" ON "homepage_rels" USING btree ("banners_id");
  CREATE INDEX "homepage_rels_categories_id_idx" ON "homepage_rels" USING btree ("categories_id");
  CREATE INDEX "homepage_rels_products_id_idx" ON "homepage_rels" USING btree ("products_id");
  CREATE INDEX "_homepage_v_blocks_hero_order_idx" ON "_homepage_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_hero_parent_id_idx" ON "_homepage_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_hero_path_idx" ON "_homepage_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_hero_background_image_idx" ON "_homepage_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_homepage_v_blocks_hero_background_video_idx" ON "_homepage_v_blocks_hero" USING btree ("background_video_id");
  CREATE INDEX "_homepage_v_blocks_trust_strip_items_order_idx" ON "_homepage_v_blocks_trust_strip_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_trust_strip_items_parent_id_idx" ON "_homepage_v_blocks_trust_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_trust_strip_order_idx" ON "_homepage_v_blocks_trust_strip" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_trust_strip_parent_id_idx" ON "_homepage_v_blocks_trust_strip" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_trust_strip_path_idx" ON "_homepage_v_blocks_trust_strip" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_stats_items_order_idx" ON "_homepage_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_stats_items_parent_id_idx" ON "_homepage_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_stats_order_idx" ON "_homepage_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_stats_parent_id_idx" ON "_homepage_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_stats_path_idx" ON "_homepage_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_shop_by_make_order_idx" ON "_homepage_v_blocks_shop_by_make" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_shop_by_make_parent_id_idx" ON "_homepage_v_blocks_shop_by_make" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_shop_by_make_path_idx" ON "_homepage_v_blocks_shop_by_make" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_promo_banners_order_idx" ON "_homepage_v_blocks_promo_banners" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_promo_banners_parent_id_idx" ON "_homepage_v_blocks_promo_banners" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_promo_banners_path_idx" ON "_homepage_v_blocks_promo_banners" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_popular_categories_order_idx" ON "_homepage_v_blocks_popular_categories" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_popular_categories_parent_id_idx" ON "_homepage_v_blocks_popular_categories" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_popular_categories_path_idx" ON "_homepage_v_blocks_popular_categories" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_feature_banners_order_idx" ON "_homepage_v_blocks_feature_banners" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_feature_banners_parent_id_idx" ON "_homepage_v_blocks_feature_banners" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_feature_banners_path_idx" ON "_homepage_v_blocks_feature_banners" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_deal_of_the_day_order_idx" ON "_homepage_v_blocks_deal_of_the_day" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_deal_of_the_day_parent_id_idx" ON "_homepage_v_blocks_deal_of_the_day" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_deal_of_the_day_path_idx" ON "_homepage_v_blocks_deal_of_the_day" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_deal_of_the_day_product_idx" ON "_homepage_v_blocks_deal_of_the_day" USING btree ("product_id");
  CREATE INDEX "_homepage_v_blocks_product_tabs_tabs_order_idx" ON "_homepage_v_blocks_product_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_product_tabs_tabs_parent_id_idx" ON "_homepage_v_blocks_product_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_product_tabs_tabs_category_idx" ON "_homepage_v_blocks_product_tabs_tabs" USING btree ("category_id");
  CREATE INDEX "_homepage_v_blocks_product_tabs_order_idx" ON "_homepage_v_blocks_product_tabs" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_product_tabs_parent_id_idx" ON "_homepage_v_blocks_product_tabs" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_product_tabs_path_idx" ON "_homepage_v_blocks_product_tabs" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_delivery_strip_order_idx" ON "_homepage_v_blocks_delivery_strip" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_delivery_strip_parent_id_idx" ON "_homepage_v_blocks_delivery_strip" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_delivery_strip_path_idx" ON "_homepage_v_blocks_delivery_strip" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_brand_marquee_order_idx" ON "_homepage_v_blocks_brand_marquee" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_brand_marquee_parent_id_idx" ON "_homepage_v_blocks_brand_marquee" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_brand_marquee_path_idx" ON "_homepage_v_blocks_brand_marquee" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_part_request_order_idx" ON "_homepage_v_blocks_part_request" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_part_request_parent_id_idx" ON "_homepage_v_blocks_part_request" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_part_request_path_idx" ON "_homepage_v_blocks_part_request" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_reviews_order_idx" ON "_homepage_v_blocks_reviews" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_reviews_parent_id_idx" ON "_homepage_v_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_reviews_path_idx" ON "_homepage_v_blocks_reviews" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_blog_teaser_order_idx" ON "_homepage_v_blocks_blog_teaser" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_blog_teaser_parent_id_idx" ON "_homepage_v_blocks_blog_teaser" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_blog_teaser_path_idx" ON "_homepage_v_blocks_blog_teaser" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_newsletter_order_idx" ON "_homepage_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_newsletter_parent_id_idx" ON "_homepage_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_newsletter_path_idx" ON "_homepage_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_banner_order_idx" ON "_homepage_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_banner_parent_id_idx" ON "_homepage_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_banner_path_idx" ON "_homepage_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_banner_banner_idx" ON "_homepage_v_blocks_banner" USING btree ("banner_id");
  CREATE INDEX "_homepage_v_blocks_rich_text_order_idx" ON "_homepage_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_rich_text_parent_id_idx" ON "_homepage_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_rich_text_path_idx" ON "_homepage_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_homepage_v_blocks_cta_order_idx" ON "_homepage_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_homepage_v_blocks_cta_parent_id_idx" ON "_homepage_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_blocks_cta_path_idx" ON "_homepage_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_makes_id_idx" ON "_homepage_v_rels" USING btree ("makes_id");
  CREATE INDEX "_homepage_v_rels_banners_id_idx" ON "_homepage_v_rels" USING btree ("banners_id");
  CREATE INDEX "_homepage_v_rels_categories_id_idx" ON "_homepage_v_rels" USING btree ("categories_id");
  CREATE INDEX "_homepage_v_rels_products_id_idx" ON "_homepage_v_rels" USING btree ("products_id");
  CREATE INDEX "announcement_bar_messages_order_idx" ON "announcement_bar_messages" USING btree ("_order");
  CREATE INDEX "announcement_bar_messages_parent_id_idx" ON "announcement_bar_messages" USING btree ("_parent_id");
  CREATE INDEX "popups_image_idx" ON "popups" USING btree ("image_id");
  CREATE INDEX "loyalty_settings_tiers_order_idx" ON "loyalty_settings_tiers" USING btree ("_order");
  CREATE INDEX "loyalty_settings_tiers_parent_id_idx" ON "loyalty_settings_tiers" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders_timeline" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "customers_addresses" CASCADE;
  DROP TABLE "customers_garage" CASCADE;
  DROP TABLE "customers_sessions" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "customers_rels" CASCADE;
  DROP TABLE "part_requests" CASCADE;
  DROP TABLE "products_cross_refs" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products_fitments" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_cross_refs" CASCADE;
  DROP TABLE "_products_v_version_specs" CASCADE;
  DROP TABLE "_products_v_version_fitments" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "makes" CASCADE;
  DROP TABLE "models" CASCADE;
  DROP TABLE "part_brands" CASCADE;
  DROP TABLE "banners" CASCADE;
  DROP TABLE "coupons" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "reviews_rels" CASCADE;
  DROP TABLE "subscribers" CASCADE;
  DROP TABLE "stock_alerts" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_banner" CASCADE;
  DROP TABLE "pages_blocks_product_grid" CASCADE;
  DROP TABLE "pages_blocks_video" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_contact" CASCADE;
  DROP TABLE "pages_blocks_part_request" CASCADE;
  DROP TABLE "pages_blocks_trust_strip_items" CASCADE;
  DROP TABLE "pages_blocks_trust_strip" CASCADE;
  DROP TABLE "pages_blocks_stats_items" CASCADE;
  DROP TABLE "pages_blocks_stats" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_product_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_video" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_part_request" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_strip_items" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_strip" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_items" CASCADE;
  DROP TABLE "_pages_v_blocks_stats" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "blog_posts_texts" CASCADE;
  DROP TABLE "blog_posts_rels" CASCADE;
  DROP TABLE "_blog_posts_v" CASCADE;
  DROP TABLE "_blog_posts_v_texts" CASCADE;
  DROP TABLE "_blog_posts_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_emails" CASCADE;
  DROP TABLE "site_settings_stores" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_texts" CASCADE;
  DROP TABLE "delivery_settings_zones" CASCADE;
  DROP TABLE "delivery_settings" CASCADE;
  DROP TABLE "delivery_settings_texts" CASCADE;
  DROP TABLE "payment_settings" CASCADE;
  DROP TABLE "navigation_header_links" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation_payment_icons" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "seo_defaults" CASCADE;
  DROP TABLE "homepage_blocks_hero" CASCADE;
  DROP TABLE "homepage_blocks_trust_strip_items" CASCADE;
  DROP TABLE "homepage_blocks_trust_strip" CASCADE;
  DROP TABLE "homepage_blocks_stats_items" CASCADE;
  DROP TABLE "homepage_blocks_stats" CASCADE;
  DROP TABLE "homepage_blocks_shop_by_make" CASCADE;
  DROP TABLE "homepage_blocks_promo_banners" CASCADE;
  DROP TABLE "homepage_blocks_popular_categories" CASCADE;
  DROP TABLE "homepage_blocks_feature_banners" CASCADE;
  DROP TABLE "homepage_blocks_deal_of_the_day" CASCADE;
  DROP TABLE "homepage_blocks_product_tabs_tabs" CASCADE;
  DROP TABLE "homepage_blocks_product_tabs" CASCADE;
  DROP TABLE "homepage_blocks_delivery_strip" CASCADE;
  DROP TABLE "homepage_blocks_brand_marquee" CASCADE;
  DROP TABLE "homepage_blocks_part_request" CASCADE;
  DROP TABLE "homepage_blocks_reviews" CASCADE;
  DROP TABLE "homepage_blocks_blog_teaser" CASCADE;
  DROP TABLE "homepage_blocks_newsletter" CASCADE;
  DROP TABLE "homepage_blocks_banner" CASCADE;
  DROP TABLE "homepage_blocks_rich_text" CASCADE;
  DROP TABLE "homepage_blocks_cta" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_blocks_hero" CASCADE;
  DROP TABLE "_homepage_v_blocks_trust_strip_items" CASCADE;
  DROP TABLE "_homepage_v_blocks_trust_strip" CASCADE;
  DROP TABLE "_homepage_v_blocks_stats_items" CASCADE;
  DROP TABLE "_homepage_v_blocks_stats" CASCADE;
  DROP TABLE "_homepage_v_blocks_shop_by_make" CASCADE;
  DROP TABLE "_homepage_v_blocks_promo_banners" CASCADE;
  DROP TABLE "_homepage_v_blocks_popular_categories" CASCADE;
  DROP TABLE "_homepage_v_blocks_feature_banners" CASCADE;
  DROP TABLE "_homepage_v_blocks_deal_of_the_day" CASCADE;
  DROP TABLE "_homepage_v_blocks_product_tabs_tabs" CASCADE;
  DROP TABLE "_homepage_v_blocks_product_tabs" CASCADE;
  DROP TABLE "_homepage_v_blocks_delivery_strip" CASCADE;
  DROP TABLE "_homepage_v_blocks_brand_marquee" CASCADE;
  DROP TABLE "_homepage_v_blocks_part_request" CASCADE;
  DROP TABLE "_homepage_v_blocks_reviews" CASCADE;
  DROP TABLE "_homepage_v_blocks_blog_teaser" CASCADE;
  DROP TABLE "_homepage_v_blocks_newsletter" CASCADE;
  DROP TABLE "_homepage_v_blocks_banner" CASCADE;
  DROP TABLE "_homepage_v_blocks_rich_text" CASCADE;
  DROP TABLE "_homepage_v_blocks_cta" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TABLE "announcement_bar_messages" CASCADE;
  DROP TABLE "announcement_bar" CASCADE;
  DROP TABLE "popups" CASCADE;
  DROP TABLE "loyalty_settings_tiers" CASCADE;
  DROP TABLE "loyalty_settings" CASCADE;
  DROP TYPE "public"."enum_orders_timeline_status";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_customers_type";
  DROP TYPE "public"."enum_part_requests_status";
  DROP TYPE "public"."enum_products_condition";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_condition";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_categories_icon";
  DROP TYPE "public"."enum_banners_placement";
  DROP TYPE "public"."enum_banners_theme";
  DROP TYPE "public"."enum_coupons_type";
  DROP TYPE "public"."enum_stock_alerts_type";
  DROP TYPE "public"."enum_pages_blocks_image_width";
  DROP TYPE "public"."enum_pages_blocks_banner_style";
  DROP TYPE "public"."enum_pages_blocks_product_grid_source";
  DROP TYPE "public"."enum_pages_blocks_trust_strip_items_icon";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_image_width";
  DROP TYPE "public"."enum__pages_v_blocks_banner_style";
  DROP TYPE "public"."enum__pages_v_blocks_product_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_trust_strip_items_icon";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_blog_posts_status";
  DROP TYPE "public"."enum__blog_posts_v_version_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_audit_logs_action";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payment_settings_card_provider";
  DROP TYPE "public"."enum_navigation_footer_columns_auto";
  DROP TYPE "public"."enum_navigation_payment_icons";
  DROP TYPE "public"."enum_homepage_blocks_trust_strip_items_icon";
  DROP TYPE "public"."enum_homepage_blocks_shop_by_make_layout";
  DROP TYPE "public"."enum_homepage_blocks_product_tabs_tabs_source";
  DROP TYPE "public"."enum_homepage_blocks_banner_style";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_blocks_trust_strip_items_icon";
  DROP TYPE "public"."enum__homepage_v_blocks_shop_by_make_layout";
  DROP TYPE "public"."enum__homepage_v_blocks_product_tabs_tabs_source";
  DROP TYPE "public"."enum__homepage_v_blocks_banner_style";
  DROP TYPE "public"."enum__homepage_v_version_status";`)
}
