import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./_components/companion-form";

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
}

const CompanionIdPage = async ({
  params: { companionId },
}: CompanionIdPageProps) => {
  // TODO: check subscription

  const companion = await prismadb.companion.findUnique({
    where: {
      id: companionId,
    },
  });

  const categories = await prismadb.category.findMany();

  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionIdPage;
