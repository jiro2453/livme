import React from 'react';
import { X } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">利用規約</h1>
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
              この利用規約（以下「本規約」）は、UTA（以下「運営者」）が提供するLiVME（以下「本サービス」）の
              利用条件を定めるものです。本サービスをご利用いただく際には、本規約に同意いただいたものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第1条（適用）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されます。</li>
              <li>運営者は本サービスに関し、本規約のほか、ご利用にあたってのルール等を定めることがあります。これらは本規約の一部を構成するものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第2条（利用資格）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本サービスは、13歳以上の方のみご利用いただけます。</li>
              <li>未成年者が本サービスを利用する場合、保護者の同意を得た上で利用してください。</li>
              <li>過去に本規約違反により利用停止された方は、本サービスを利用できません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第3条（アカウント登録）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>ユーザーは、真実、正確かつ完全な情報を登録する必要があります。</li>
              <li>ユーザーは、登録情報に変更があった場合、速やかに変更の手続きを行うものとします。</li>
              <li>ユーザーは、自己の責任において、パスワードを適切に管理するものとします。</li>
              <li>ユーザーIDおよびパスワードが第三者に使用されたことによって生じた損害について、運営者は一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第4条（禁止事項）</h2>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>運営者、他のユーザー、または第三者の権利を侵害する行為</li>
              <li>運営者、他のユーザー、または第三者に不利益、損害を与える行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>運営者のサービスに過度な負荷をかける行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>わいせつな表現を含む情報を送信する行為</li>
              <li>他人を差別または誹謗中傷する内容を送信する行為</li>
              <li>暴力的・残虐な表現を含む情報を送信する行為</li>
              <li>宗教的または政治的な主張を含む情報を送信する行為</li>
              <li>スパム行為、またはこれに類する行為</li>
              <li>営利目的での本サービスの利用</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第5条（本サービスの提供の停止等）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
                  <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                  <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
                </ul>
              </li>
              <li>運営者は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第6条（利用制限および登録抹消）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>運営者は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>本規約のいずれかの条項に違反した場合</li>
                  <li>登録事項に虚偽の事実があることが判明した場合</li>
                  <li>その他、運営者が本サービスの利用を適当でないと判断した場合</li>
                </ul>
              </li>
              <li>運営者は、本条に基づき運営者が行った行為によりユーザーに生じた損害について、一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第7条（著作権）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た投稿コンテンツのみを投稿できるものとします。</li>
              <li>ユーザーが本サービスに投稿したコンテンツの著作権は、ユーザーに留保されます。</li>
              <li>運営者は、ユーザーが投稿したコンテンツを、本サービスの運営、改善、プロモーションのために利用することができるものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第8条（免責事項）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>運営者は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
              <li>本サービスは現状有姿で提供されるものであり、運営者は本サービスについて、特定の目的への適合性、完全性、正確性、有用性等を保証するものではありません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第9条（サービス内容の変更等）</h2>
            <p>
              運営者は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、
              これによってユーザーに生じた損害について一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第10条（利用規約の変更）</h2>
            <p>
              運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
              変更後の利用規約は、本サービス上に表示した時点より効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">第11条（準拠法・裁判管轄）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
              <li>本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">お問い合わせ</h2>
            <p>本規約に関するお問い合わせは、以下までご連絡ください。</p>
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
