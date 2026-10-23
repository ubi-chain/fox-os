export type BuildFile = { path: string; body: string };

export type BuildPlan = {
  summary: string;
  files: BuildFile[];
  note: string;
};

function modelName(prompt: string): string {
  if (/コメント|comment/i.test(prompt)) return "Comment";
  if (/投稿|記事|post/i.test(prompt)) return "Post";
  const found = prompt.match(/\b([A-Z][A-Za-z0-9]+)\b/);
  return found?.[1] ?? "Note";
}

function fieldsOf(prompt: string): Array<{ name: string; type: "string" | "text" }> {
  const fields: Array<{ name: string; type: "string" | "text" }> = [];
  if (/title|タイトル|題/.test(prompt)) fields.push({ name: "title", type: "string" });
  if (/body|本文|内容|text/.test(prompt)) fields.push({ name: "body", type: "text" });
  if (fields.length === 0) {
    fields.push({ name: "title", type: "string" }, { name: "body", type: "text" });
  }
  return fields;
}

export function planBuild(prompt: string, project = "/home/fox/sample_app"): BuildPlan {
  const name = modelName(prompt);
  const snake = name.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  const plural = `${snake}s`;
  const fields = fieldsOf(prompt);
  const columns = fields.map((field) => `t.${field.type} :${field.name}`).join("\n      ");
  const assigns = fields.map((field) => `:${field.name}`).join(", ");
  return {
    summary: `${name} のモデル、コントローラー、ルート、マイグレーションを ${project} に足します。`,
    note: "外部の Copilot には送っていません。この机の中だけで組み立てます。承認するまでファイルは書きません。",
    files: [
      {
        path: `${project}/app/models/${snake}.rb`,
        body: `class ${name} < ApplicationRecord\nend\n`,
      },
      {
        path: `${project}/app/controllers/${plural}_controller.rb`,
        body: `class ${name}sController < ApplicationController\n  def index\n    render plain: "${plural}"\n  end\n\n  def create\n    permitted = params.permit(${assigns})\n    render plain: permitted.to_h.inspect\n  end\nend\n`,
      },
      {
        path: `${project}/config/routes.rb`,
        body: `Rails.application.routes.draw do\n  resources :${plural}\n  root "home#index"\nend\n`,
      },
      {
        path: `${project}/db/migrate/20261023000000_create_${plural}.rb`,
        body: `class Create${name}s < ActiveRecord::Migration[7.2]\n  def change\n    create_table :${plural} do |t|\n      ${columns}\n      t.timestamps\n    end\n  end\nend\n`,
      },
    ],
  };
}
