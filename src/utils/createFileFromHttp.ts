export default async function createFileFromHttp(
  url: string,
  defaultName?: string
) {
  const fileName = url.split('/').pop() || defaultName || 'file-without-a-name';
  const response = await fetch(url);
  const data = await response.blob();
  const metadata = {
    // type: 'image/jpeg',
  };
  return new File([data], fileName, metadata);
}
