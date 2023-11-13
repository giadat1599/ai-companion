import prismadb from "@/lib/prismadb";
import { auth, redirectToSignIn } from "@clerk/nextjs";

import { CompanionForm } from "./_components/companion-form";

interface CompanionIdPageProps {
   params: {
      companionId: string;
   };
}

const CompanionIdPage = async ({ params: { companionId } }: CompanionIdPageProps) => {
   const { userId } = auth();
   // TODO: check subscription

   if (!userId) return redirectToSignIn();

   const companion = await prismadb.companion.findUnique({
      where: {
         id: companionId,
         userId,
      },
   });

   const categories = await prismadb.category.findMany();

   return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
