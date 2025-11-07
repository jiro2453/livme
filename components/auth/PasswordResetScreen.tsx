import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../hooks/useToast';

interface PasswordResetScreenProps {
  onSwitchToLogin: () => void;
}

export const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: '送信完了',
        description: 'パスワードリセット用のメールを送信しました',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: '送信に失敗しました',
        description: error.message || 'メール送信中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
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
          <h1 className="text-[21px] font-bold text-center mb-8">パスワードリセット</h1>

          {sent ? (
            <div>
              <p className="text-sm text-gray-600 text-center mb-8">
                パスワードリセット用のメールを送信しました。メール内のリンクをクリックして、新しいパスワードを設定してください。
              </p>
              <Button
                onClick={onSwitchToLogin}
                className="w-full h-12 text-base font-medium"
              >
                ログイン画面に戻る
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* メールアドレス */}
              <div className="mb-6">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレス"
                  className="bg-yellow-50 border-yellow-100 focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              {/* 送信ボタン */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium mb-8"
                disabled={loading}
              >
                {loading ? '送信中...' : 'リセットメールを送信'}
              </Button>

              {/* ログインリンク */}
              <div className="text-center text-sm text-gray-600">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary hover:underline"
                >
                  ログイン画面に戻る
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
