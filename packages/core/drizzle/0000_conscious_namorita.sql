CREATE TYPE "public"."channel_type" AS ENUM('discord', 'slack', 'webhook');--> statement-breakpoint
CREATE TYPE "public"."http_method" AS ENUM('GET', 'HEAD');--> statement-breakpoint
CREATE TYPE "public"."monitor_status" AS ENUM('pending', 'up', 'down', 'paused');--> statement-breakpoint
CREATE TABLE "alert_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "channel_type" NOT NULL,
	"url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"monitor_id" integer NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ok" boolean NOT NULL,
	"status_code" integer,
	"response_ms" integer NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"monitor_id" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"cause" text
);
--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"method" "http_method" DEFAULT 'GET' NOT NULL,
	"interval_seconds" integer DEFAULT 60 NOT NULL,
	"timeout_ms" integer DEFAULT 10000 NOT NULL,
	"expected_status" integer,
	"keyword" text,
	"failure_threshold" integer DEFAULT 2 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"status" "monitor_status" DEFAULT 'pending' NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"last_checked_at" timestamp with time zone,
	"last_response_ms" integer,
	"last_error" text,
	"ssl_expires_at" timestamp with time zone,
	"ssl_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checks" ADD CONSTRAINT "checks_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "checks_monitor_time_idx" ON "checks" USING btree ("monitor_id","checked_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "incidents_monitor_idx" ON "incidents" USING btree ("monitor_id","started_at" DESC NULLS LAST);