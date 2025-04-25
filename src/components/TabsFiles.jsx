import {
  BoxIcon,
  FileChartPie,
  HouseIcon,
  ListChecks,
  PanelsTopLeftIcon,
  Paperclip,
} from "lucide-react";
import UploadPPTDialog from "@/components/UploadPPTDialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadPDFDialog from "./UploadPDFDialog";
import TestCreator from "./CreateTestDialog";

export default function TabsFiles({ chapter_id }) {
  return (
    <Tabs defaultValue="tab-1" className="mt-5">
      <ScrollArea>
        <TabsList className="before:bg-border relative mb-3 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          <TabsTrigger
            value="tab-1"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t  py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <Paperclip
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
              strokeWidth={2.2}
              color="#0086f9"
            />
            PDF fayllar
          </TabsTrigger>
          <TabsTrigger
            value="tab-2"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <FileChartPie
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
              color="#e13303"
              strokeWidth={2.5}
            />
            Prezentatsiyalar
          </TabsTrigger>
          <TabsTrigger
            value="tab-3"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <ListChecks
              className="-ms-0.5 me-1.5 opacity-60"
              size={16}
              aria-hidden="true"
              color="#0086f9"
              strokeWidth={2.5}
            />
            Testlar
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <TabsContent value="tab-1">
        <UploadPDFDialog chapterId={chapter_id} />
      </TabsContent>
      <TabsContent value="tab-2">
        <UploadPPTDialog chapterId={chapter_id} />
      </TabsContent>
      <TabsContent value="tab-3">
        <TestCreator chapter_id={chapter_id} />
      </TabsContent>
    </Tabs>
  );
}
