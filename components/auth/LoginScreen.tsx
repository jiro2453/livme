import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/useToast';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSwitchToRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔵 Login form submitted', { email });

    setLoading(true);
    setErrorMessage(''); // Clear previous errors

    try {
      console.log('🔵 Calling signIn...');
      await signIn(email, password);
      console.log('✅ Login successful');
      toast({
        title: 'ログインしました',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      const errorMsg = error.message || 'メールアドレスまたはパスワードが正しくありません';
      setErrorMessage(errorMsg);
      toast({
        title: 'ログインに失敗しました',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      console.log('🔵 Login attempt finished');
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrorMessage(''); // Clear error when user types
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorMessage(''); // Clear error when user types
  };

  const scrollToLanding = (e: React.MouseEvent) => {
    e.preventDefault();
    const landingSection = document.getElementById('landing-section');
    if (landingSection) {
      landingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* ログインセクション */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md min-h-[500px] shadow-sm border border-primary/30 bg-white">
          <CardContent className="pt-8 pb-6 px-10">
            {/* ロゴ */}
            <div className="flex justify-center mb-6">
              <picture>
                <source srcSet="/LiVME_2.webp" type="image/webp" />
                <img
                  src="/LiVME_2.png"
                  alt="LiVME Logo"
                  className="h-20 w-auto"
                />
              </picture>
            </div>

            {/* タイトル */}
            <h1 className="text-[15.75px] font-bold text-center mb-8">ログイン</h1>

            <form onSubmit={handleSubmit}>
              <div className="max-w-xs mx-auto">
                {/* メールアドレス */}
                <div className="mb-6">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="メールアドレス"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                  />
                </div>

                {/* パスワード */}
                <div className="relative mb-6">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="パスワード"
                    required
                    className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* エラーメッセージ */}
                {errorMessage && (
                  <div className="mb-6 text-red-600 text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* ログインボタン */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium mb-6"
                  disabled={loading}
                >
                  {loading ? 'ログイン中...' : 'ログイン'}
                </Button>
              </div>

              {/* 新規登録 */}
              <div className="text-center text-sm text-gray-600">
                アカウントをお持ちでない方は{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-primary hover:underline font-medium"
                >
                  新規登録
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 利用方法へのリンク（Card外） */}
        <div className="mt-6 text-center">
          <a
            href="#landing-section"
            onClick={scrollToLanding}
            className="inline-flex flex-col items-center text-primary hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-medium mb-1">利用方法</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </div>

      {/* ランディングセクション */}
      <div
        id="landing-section"
        className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#f8f9fa] font-sans"
      >
        <div className="max-w-4xl w-full text-center">
          {/* ロゴ動画 */}
          <div className="flex justify-center mb-8">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-32 w-auto"
            >
              <source src="/LiVME_2.mp4" type="video/mp4" />
            </video>
          </div>

          {/* タグライン */}
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 whitespace-nowrap">
            LIVEとMEをつなぐ場所
          </h2>

          {/* 説明文 */}
          <p className="text-gray-700 leading-relaxed mb-12 max-w-3xl mx-auto">
            LiVME-ライム-はユーザーのライブ参加情報をシェアし、同じ趣味を持つ新たな仲間が見つかる無料のサービスです。
          </p>

          {/* 3つのカード */}
          <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
            {/* LP1 */}
            <Card
              id="feature-1"
              className="shadow-sm border border-primary/30 bg-white cursor-pointer hover:shadow-md transition-shadow scroll-mt-32"
              onClick={() => {
                const element = document.getElementById('feature-1');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              <CardContent className="pt-8 pb-6 px-6">
                <h3 className="text-[15px] font-semibold text-primary mb-4 text-center">特徴その1</h3>
                <div className="flex justify-center mb-4">
                  <img
                    src="/lp1-feature.png"
                    alt="特徴その1"
                    className="h-48 w-auto"
                  />
                </div>
                <p className="text-gray-600 leading-relaxed text-center">
                  行く予定のライブや過去に参加したライブを簡単に管理できます。
                </p>
              </CardContent>
            </Card>

            {/* LP2 */}
            <Card
              id="feature-2"
              className="shadow-sm border border-primary/30 bg-white cursor-pointer hover:shadow-md transition-shadow scroll-mt-32"
              onClick={() => {
                const element = document.getElementById('feature-2');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              <CardContent className="pt-8 pb-6 px-6">
                <h3 className="text-[15px] font-semibold text-primary mb-4 text-center">特徴その2</h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  同じライブに参加する仲間を見つけることができます。
                </p>
              </CardContent>
            </Card>

            {/* LP3 */}
            <Card
              id="feature-3"
              className="shadow-sm border border-primary/30 bg-white cursor-pointer hover:shadow-md transition-shadow scroll-mt-32"
              onClick={() => {
                const element = document.getElementById('feature-3');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              <CardContent className="pt-8 pb-6 px-6">
                <h3 className="text-[15px] font-semibold text-primary mb-4 text-center">特徴その3</h3>
                <p className="text-gray-600 leading-relaxed text-center">
                  プロフィールやギャラリーで、あなたの魅力を最大限に伝えられます。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* トップに戻るリンク */}
          <div className="mt-16">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex flex-col items-center text-primary hover:opacity-80 transition-opacity"
            >
              <ChevronUp className="h-5 w-5 animate-bounce" />
              <span className="text-sm font-medium mt-1">ログイン画面に戻る</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
