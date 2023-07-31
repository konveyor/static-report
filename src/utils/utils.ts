import { LinkDto } from "@app/api/output";

export const getMarkdown = (body: string, links: LinkDto[]): string => {
  const formattedLinks = (links || [])
    .map((link, index) => `${index + 1}. [${link.title}](${link.url})`)
    .join("\n");
  return [body, formattedLinks].join("\n");
};


export const capitalizeFirstLetter = (val: string) => {
  if (!val) {
    return val;
  }

  return val.charAt(0).toUpperCase() + val.slice(1);
};