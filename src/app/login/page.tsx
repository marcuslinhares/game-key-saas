import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome to the Game Key Marketplace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to start buying and selling game keys.
          </p>
        </div>
        <div className="flex justify-center">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
