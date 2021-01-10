/* eslint-disable @typescript-eslint/no-explicit-any */
import csvParse from 'csv-parse';
import fs from 'fs';
// import path from 'path';

export default async (absoluteFilePath: string): Promise<any[]> => {
  async function loadCSV(filePath: string): Promise<any[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] | PromiseLike<any[]> = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }

  // const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', 'import_template.csv')

  const csvData = await loadCSV(absoluteFilePath);

  return csvData;
};
