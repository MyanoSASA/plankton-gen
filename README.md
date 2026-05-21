# plankton-gen

前句と後句をランダムに組み合わせて名前を生成する、シンプルな静的Webアプリです。

## ファイル構成

- `index.html`: 画面本体
- `style.css`: レイアウト、配色、アニメーション
- `script.js`: 語句データ、抽選処理、履歴、ローカル保存

## 使い方

ブラウザで `index.html` を開くと使えます。

- `まわす` で名前を生成
- `語彙と設定` から前句・後句を追加
- 追加した語彙は `localStorage` に保存

## 語句の追加

固定語句を増やしたい場合は、`script.js` 内の `basePrefixes` と `baseSuffixes` を編集してください。

## 公開

静的ファイルのみで動作するため、そのまま GitHub Pages で公開できます。

## ライセンス

MIT License
