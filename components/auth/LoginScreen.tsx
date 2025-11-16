import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/useToast';
import { Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSwitchToRegister,
  onSwitchToReset,
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

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#f8f9fa]">
      <Card className="w-full max-w-md min-h-[500px] shadow-sm border border-primary/30 bg-white">
        <CardContent className="pt-8 pb-6 px-10">
          {/* ロゴ */}
          <div className="flex justify-center mb-6">
            <img
              src="/LiVME_2.png"
              alt="LiVME Logo"
              className="h-20 w-auto"
            />
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

            {/* パスワードを忘れた方 */}
            <div className="text-center mb-4">
              <button
                type="button"
                onClick={onSwitchToReset}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                パスワードを忘れた方はこちら
              </button>
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
    </div>
  );
};
