import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <p className="text-sm text-gray-600">最終更新日：2025年1月</p>
            <p>
              UTA（以下「運営者」）は、LiVME（以下「本サービス」）の提供にあたり、
              ユーザーの個人情報の保護を重要な責務と考え、以下のとおりプライバシーポリシーを定めます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">1. 収集する情報</h2>
            <p>本サービスでは、以下の情報を収集します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>メールアドレス</li>
              <li>ユーザー名、ユーザーID</li>
              <li>プロフィール情報（自己紹介、アバター画像、SNSリンク等）</li>
              <li>ライブ・公演情報</li>
              <li>サービス利用に関する情報（アクセスログ、Cookie等）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. 情報の利用目的</h2>
            <p>収集した情報は、以下の目的で利用します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>本サービスの提供、運営、改善</li>
              <li>ユーザーサポート</li>
              <li>利用規約違反の対応</li>
              <li>サービスに関するお知らせの送信</li>
              <li>統計データの作成</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. 第三者サービスの利用</h2>
            <p>本サービスでは、以下の第三者サービスを利用しています：</p>

            <h3 className="text-base font-semibold mt-4 mb-2">Supabase</h3>
            <p>データベースおよび認証サービスとして利用しています。詳細は<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Supabaseのプライバシーポリシー</a>をご確認ください。</p>

            <h3 className="text-base font-semibold mt-4 mb-2">忍者AdMax</h3>
            <p>
              本サービスは、広告配信のために忍者AdMaxを使用しています。
              忍者AdMaxは、Cookieを使用して広告を表示します。
              詳細については、
              <a href="https://www.ninja.co.jp/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary underline">忍者ツールズのプライバシーポリシー</a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Cookieの使用</h2>
            <p>
              本サービスでは、サービスの利便性向上および広告配信のためにCookieを使用します。
              Cookieの使用に同意いただけない場合、一部のサービス機能が利用できない可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. 情報の第三者提供</h2>
            <p>
              運営者は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. 情報の管理</h2>
            <p>
              運営者は、個人情報の正確性を保ち、不正アクセス、紛失、破壊、改ざん、漏洩等を防止するため、
              適切な安全管理措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. ユーザーの権利</h2>
            <p>ユーザーは、自身の個人情報について以下の権利を有します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>開示、訂正、削除の請求</li>
              <li>利用停止の請求</li>
            </ul>
            <p className="mt-2">
              これらの請求については、下記のお問い合わせ先までご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. プライバシーポリシーの変更</h2>
            <p>
              運営者は、必要に応じて本プライバシーポリシーを変更することがあります。
              変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. お問い合わせ</h2>
            <p>本プライバシーポリシーに関するお問い合わせは、以下までご連絡ください。</p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="font-semibold">運営者：UTA</p>
              <p>所在地：東京都</p>
              <p>メールアドレス：utada.develop@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
