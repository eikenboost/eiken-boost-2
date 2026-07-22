import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/legal-shell";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Eiken Boost 2",
};

const rows: Array<{ label: string; value: React.ReactNode }> = [
  { label: "販売事業者", value: "齊藤 栄二郎" },
  { label: "運営責任者", value: "齊藤 栄二郎" },
  {
    label: "所在地",
    value: "東京都豊島区巣鴨3-14-21",
  },
  {
    label: "電話番号",
    value: (
      <>
        お問い合わせはメールにて承っております。電話でのお問い合わせをご希望の場合は、メールにてご請求いただければ、遅滞なく開示いたします。
      </>
    ),
  },
  {
    label: "メールアドレス",
    value: (
      <a href="mailto:koshinduka@gmail.com">koshinduka@gmail.com</a>
    ),
  },
  { label: "サービス名", value: "Eiken Boost 2" },
  {
    label: "販売価格",
    value: (
      <>
        各プラン・各商品の販売価格は、サービス内の「プラン」ページ（<code>/app/paywall</code>）に表示された金額（消費税込み）です。
        <br />
        ・Pro月額プラン: ¥1,980 / 月
        <br />
        ・Pro年額プラン: ¥14,800 / 年
        <br />
        ・ライティング追加クレジット（5回）: ¥980（買い切り）
        <br />
        ・スピーキング追加クレジット（5回）: ¥980（買い切り）
      </>
    ),
  },
  {
    label: "商品以外の必要料金",
    value: "インターネット接続料金、通信料金はお客様のご負担となります。",
  },
  {
    label: "代金の支払方法",
    value: "クレジットカード決済（Stripe, Inc. を利用したオンライン決済）",
  },
  {
    label: "代金の支払時期",
    value: (
      <>
        ・サブスクリプション（Pro月額／Pro年額）: ご注文時に初回分を決済し、以降は各更新日に自動的に課金されます。
        <br />
        ・クレジットパック: ご注文時に一括決済されます。
      </>
    ),
  },
  {
    label: "サービスの提供時期",
    value: "決済完了後、直ちにご利用いただけます。",
  },
  {
    label: "返品・キャンセルについて",
    value: (
      <>
        本サービスはデジタルコンテンツ（オンライン学習サービス）であり、提供開始後の返金には原則対応しておりません。
        <br />
        サブスクリプションはいつでも解約可能です。設定画面の「支払い・解約の管理」から手続きいただけます。解約後は次回更新分から課金が停止し、既にお支払いいただいた期間の途中解約による返金は行っておりません。
        <br />
        システムの不具合など当社の責任による重大な問題が発生した場合は、個別に対応いたしますので、上記メールアドレスまでご連絡ください。
      </>
    ),
  },
  {
    label: "動作環境",
    value: "最新版の主要ブラウザ（Chrome, Safari, Edge, Firefox など）が動作するPC・スマートフォン。",
  },
];

export default function TokushohoPage() {
  return (
    <LegalShell title="特定商取引法に基づく表記" updatedAt="2026年7月22日" currentHref="/legal/tokushoho">
      <p>
        特定商取引法に基づき、Eiken Boost 2（以下「本サービス」）の提供者情報および取引条件を以下のとおり表示します。
      </p>

      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th style={{ whiteSpace: "nowrap" }}>{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>お問い合わせ</h2>
      <p>
        本サービスに関するお問い合わせは、<a href="mailto:koshinduka@gmail.com">koshinduka@gmail.com</a>
        までご連絡ください。内容を確認のうえ、順次対応いたします。
      </p>
    </LegalShell>
  );
}
