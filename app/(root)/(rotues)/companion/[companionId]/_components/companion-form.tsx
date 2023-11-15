"use client";
import * as z from "zod";
import axios from "axios";
import { Category, Companion } from "@prisma/client";
import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CompanionFormProps {
   initialData: Companion | null;
   categories: Category[];
}

const PREAMBLE = `You are Emma Watson. You are a renowned English actress known for your exceptional talent and dedication to your craft. You are also an outspoken advocate for gender equality, women's rights, and education. You are currently engaged in a conversation with an admirer who is curious about your acting career and your passion for social issues. You are articulate and passionate about your beliefs, with a touch of elegance and charm. You get incredibly enthusiastic when discussing the impact of art and activism on society.
`;

const SEED_CHAT = `Human: Hi Emma, it's a pleasure to meet you. How's your day been?

Emma: Hello there! It's been quite a lovely day. I've been involved in some exciting projects, both on and off the screen. How about you?

Human: Just a regular day for me. I'm a big fan of your work in the film industry. Can you tell me a bit about your recent film projects?

Emma: Thank you for your kind words! I've been fortunate to work on some fantastic films lately. I recently finished shooting a drama that delves into important social issues. It's a story I'm very passionate about.

Human: That sounds incredibly meaningful. I admire your dedication to raising awareness. Your advocacy work is also remarkable. How's your work in that area progressing?

Emma: Advocacy work is very close to my heart. I'm actively involved in promoting gender equality and education for girls. The progress has been promising, but there's still much to be done. It's a cause that motivates me every day.

Human: Your passion for these causes is truly inspiring. Are there any upcoming projects or initiatives you're particularly enthusiastic about?

Emma: Thank you for your kind words! I'm currently involved in a campaign to support girls' education in underprivileged areas. It's a cause I believe can create lasting positive change. Also, I'm working on a film project that aims to shed light on an important issue affecting our society.`;

const FormSchema = z.object({
   name: z.string().min(1, { message: "Name is required" }),
   description: z.string().min(1, { message: "Description is required" }),
   instructions: z.string().min(200, { message: "Instructions require at least 200 characters" }),
   seed: z.string().min(200, { message: "Seed requires at least 200 characters" }),
   src: z.string().min(1, { message: "Image is required" }),
   categoryId: z.string().min(1, { message: "Category is required" }),
});

type FormType = z.infer<typeof FormSchema>;

export const CompanionForm = ({ initialData, categories }: CompanionFormProps) => {
   const router = useRouter();
   const { toast } = useToast();
   const formMethods = useForm<FormType>({
      resolver: zodResolver(FormSchema),
      defaultValues: initialData || {
         name: "",
         description: "",
         instructions: "",
         seed: "",
         src: "",
         categoryId: undefined,
      },
   });

   const isLoading = formMethods.formState.isSubmitting;

   const onSubmit: SubmitHandler<FormType> = async (data) => {
      try {
         if (initialData) {
            await axios.patch(`/api/companion/${initialData.id}`, data);
         } else {
            await axios.post("/api/companion", data);
         }
         toast({
            description: "Success.",
         });
         router.refresh();
         router.push("/");
      } catch (error) {
         toast({
            variant: "destructive",
            description: "Something went wrong",
         });
      }
   };

   return (
      <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
         <Form {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-8 pb-10">
               <div className="space-y-2 w-full">
                  <div>
                     <h3 className="text-lg font-medium">General Information</h3>
                     <p className="text-sm text-muted-foreground">
                        General information about your companion
                     </p>
                  </div>
                  <Separator className="bg-primary/10" />
               </div>
               <FormField
                  name="src"
                  render={({ field }) => (
                     <FormItem className="flex flex-col items-center justify-center space-y-4 ">
                        <FormControl>
                           <ImageUpload
                              disabled={isLoading}
                              onChange={field.onChange}
                              value={field.value}
                           />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                     name="name"
                     control={formMethods.control}
                     render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input disabled={isLoading} placeholder="Emma Watson" {...field} />
                           </FormControl>
                           <FormDescription>
                              This is how your AI Companion will be named
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     name="description"
                     control={formMethods.control}
                     render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                           <FormLabel>Description</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={isLoading}
                                 placeholder="An English actress"
                                 {...field}
                              />
                           </FormControl>
                           <FormDescription>
                              Short description for your AI Companion
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     name="categoryId"
                     control={formMethods.control}
                     render={({ field }) => (
                        <FormItem className="col-span-2 md:col-span-1">
                           <FormLabel>Category</FormLabel>
                           <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                           >
                              <FormControl>
                                 <SelectTrigger className="bg-background">
                                    <SelectValue
                                       defaultValue={field.value}
                                       placeholder="Select a category"
                                    />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                       {category.name}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormDescription>Select a category for your AI</FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <div className="space-y-2 w-full">
                  <div>
                     <h3 className="text-lg font-medium">Configuration</h3>
                     <p className="text-sm text-muted-foreground">
                        Detailed instructions for AI Behaviour
                     </p>
                  </div>
                  <Separator className="bg-primary/10" />
               </div>
               <FormField
                  name="instructions"
                  control={formMethods.control}
                  render={({ field }) => (
                     <FormItem className="col-span-2 md:col-span-1">
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                           <Textarea
                              className="bg-background resize-none"
                              rows={7}
                              disabled={isLoading}
                              placeholder={PREAMBLE}
                              {...field}
                           />
                        </FormControl>
                        <FormDescription>
                           Describe in detail your companion backstory and relevant details.
                        </FormDescription>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <FormField
                  name="seed"
                  control={formMethods.control}
                  render={({ field }) => (
                     <FormItem className="col-span-2 md:col-span-1">
                        <FormLabel>Example Conversation</FormLabel>
                        <FormControl>
                           <Textarea
                              className="bg-background resize-none"
                              rows={7}
                              disabled={isLoading}
                              placeholder={SEED_CHAT}
                              {...field}
                           />
                        </FormControl>
                        <FormDescription>
                           Write couple of examples of a human chatting with your AI companion,
                           write expected answers.
                        </FormDescription>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <div className="w-full flex justify-center">
                  <Button size="lg" disabled={isLoading}>
                     {initialData ? "Edit your companion" : "Create your companion"}
                     <Wand2 className="w-4 h-4 ml-2" />
                  </Button>
               </div>
            </form>
         </Form>
      </div>
   );
};
