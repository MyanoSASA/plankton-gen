# plankton-gen

GitHub Pages でそのまま公開できる、静的な `html/css/js` の名前ジェネレーターです。
リポジトリ名は `plankton-gen` 想定です。

## 構成

- `index.html`: 画面本体
- `style.css`: レトロ看板っぽい UI
- `script.js`: 語句データ、ルーレット、追加語句の保存

## GitHub Pages

1. このディレクトリを GitHub リポジトリに push
2. GitHub の `Settings > Pages` でデプロイ元ブランチを選択
3. ルート (`/`) を公開対象に設定

## 語句を増やす

- 固定語句を増やす: `script.js` の `basePrefixes` と `baseSuffixes` に追記
- ブラウザ上で増やす: 画面の「語句を追加」から入力

## メモ

- 追加語句は `localStorage` に保存されます
- 理論上の組み合わせ数は `前句数 x 後句数` です
