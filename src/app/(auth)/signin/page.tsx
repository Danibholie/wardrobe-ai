import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Welcome to Wardrobe AI</h1>

        <p className="mt-2 text-gray-600">
          Sign in to build your wardrobe and plan better outfits.
        </p>

        <form
          className="mt-8"
          action={async () => {
            "use server";

            await signIn("google", {
              redirectTo: "/",
            });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl border px-4 py-3 font-medium"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
