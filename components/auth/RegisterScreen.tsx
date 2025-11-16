import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/useToast';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const validateUserId = (id: string): boolean => {
    const regex = /^[a-zA-Z0-9_-]{3,30}$/;
    return regex.test(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🟢 Register form submitted', { email, name, userId });

    if (password !== confirmPassword) {
      console.warn('⚠️ Password mismatch');
      toast({
        title: 'エラー',
        description: 'パスワードが一致しません',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      console.warn('⚠️ Password too short');
      toast({
        title: 'エラー',
        description: 'パスワードは8文字以上である必要があります',
        variant: 'destructive',
      });
      return;
    }

    if (!validateUserId(userId)) {
      console.warn('⚠️ Invalid userId format');
      toast({
        title: 'エラー',
        description: 'ユーザーIDは英数字・ハイフン・アンダースコアのみ、3-30文字で入力してください',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🟢 Calling signUp...');
      await signUp(email, password, name, userId);
      console.log('✅ Signup successful');
      toast({
        title: '登録完了',
        description: 'アカウントが作成されました',
        variant: 'success',
      });
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      toast({
        title: '登録に失敗しました',
        description: error.message || '登録中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      console.log('🟢 Signup attempt finished');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#f8f9fa]">
      <Card className="w-full max-w-md shadow-sm border border-primary/30 bg-white">
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
          <h1 className="text-[21px] font-bold text-center mb-8">新規登録</h1>
          <form onSubmit={handleSubmit}>
            {/* 名前 */}
            <div className="mb-6">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名前"
                className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
              />
            </div>

            {/* ユーザーID */}
            <div className="mb-6">
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ユーザーID（英数字・ハイフン・アンダースコア 3-30文字）"
                className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
              />
            </div>

            {/* メールアドレス */}
            <div className="mb-6">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス"
                className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
              />
            </div>

            {/* パスワード */}
            <div className="mb-6">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード（8文字以上）"
                className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
              />
            </div>

            {/* パスワード確認 */}
            <div className="mb-6">
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワード確認"
                className="bg-gray-50 border-gray-200 focus:border-primary focus:ring-primary placeholder:text-sm"
                required
              />
            </div>

            {/* 登録ボタン */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium mb-8"
              disabled={loading}
            >
              {loading ? '登録中...' : '登録'}
            </Button>

            {/* ログインリンク */}
            <div className="text-center text-sm text-gray-600">
              アカウントをお持ちの方は{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
              >
                ログイン
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
