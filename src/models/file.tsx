import { IncidentDto } from "../api/report";

// DispersedFile stores different ranges of source code snips we get for each file
// since we do not index an entire file, we keep track of ranges of code snips for 
// a file, merging overlapping code snips, this helps us reduce total tabs in modal
// each file is stored line by line in content, ranges maintain non-overlapping ranges
// of lines in the original file we have found in code snips. incidents is a bucket of
// incidents appearing on any given range in the file
export interface DispersedFile {
    ranges: number[];
    totalIncidents: number;
    name: string;
    displayName: string;
    incidents: {
        [key: number]: IncidentCoordinates[];
    };
    codeSnips: string[];
    incidentsUnorganized: IncidentCoordinates[];
}

export interface IncidentCoordinates {
    lineNumber: number;
    message: string;
}

const bisect_left = (arr: number[], a: number): number => {
    var lo = 0;
    var hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] < a) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo
}

const bisect_right = (arr: number[], a: number): number => {
    var lo = 0;
    var hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] <= a) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo
}

export const getCodeSnip = (df: DispersedFile, idx: number): string => {
    if (!df || !df.ranges || df.ranges.length <= idx*2+1) {
        return ""
    }
    // get the code snip in this range
    const rangeStart = df.ranges[idx*2]
    const rangeEnd = df.ranges[idx*2+1]
    let codeSnip: string[] = Array.from({ length: rangeEnd - rangeStart + 1}, () => "");
    let seen: { [key: number]: boolean } = {}
    for (const snip of df.codeSnips) {
        for (const line of snip.split("\n")) {
            const lineNo = getLineNumber(line)
            if (lineNo < 0 || isNaN(lineNo) || lineNo < rangeStart || lineNo > rangeEnd) {
                continue
            }
            if (!seen[lineNo]) {            
                seen[lineNo] = true
                codeSnip[lineNo-rangeStart] = line
            }
        }
        if ((Object.keys(seen).length) === rangeEnd - rangeStart + 1) {
            break
        }
    }
    return codeSnip.join("\n");
};


  const getLineNumber = (s: string) => {
    const m = s.match(/^ *(\d+)?.*/)
    return m ? parseInt(m[1]) : -1
}

export const addIncidentToDispersedFile = (df: DispersedFile, incident: IncidentDto) => {
    df.totalIncidents += 1
    const content = incident.codeSnip ? incident.codeSnip : "";
    const contentList: string[] = (content.split("\n") || []).filter(a => a && a !== "");
    if (!contentList || contentList.length === 0) {
        return
    }
    const firstLine = getLineNumber(contentList[0])
    const lastLine = getLineNumber(contentList[contentList.length - 1])
    if ((lastLine >= firstLine) && (firstLine !== -1)) {
        const start = bisect_left(df.ranges, firstLine)
        const end = bisect_right(df.ranges, lastLine)
        var toPush = []
        if (start % 2 === 0) {
            toPush.push(firstLine)
        }
        if (end % 2 === 0) {
            toPush.push(lastLine)
        }
        const left = df.ranges.slice(0, start)
        const right = df.ranges.slice(end, df.ranges.length)
        df.ranges = left.concat(toPush).concat(right)
        df.codeSnips.push(incident.codeSnip)
        df.incidentsUnorganized.push({lineNumber: incident.lineNumber, message: incident.message})
    }
}

export const organizeDispersedFile = (df: DispersedFile): DispersedFile => {
    // organize incidents based on which bucket they fall in
    df.incidentsUnorganized.forEach((inc, idx) => {
        if (inc.lineNumber !== undefined && !isNaN(inc.lineNumber)) {
            const bucket = Math.floor(bisect_left(df.ranges, inc.lineNumber) / 2);
            if (!df.incidents[bucket]) {
                df.incidents[bucket] = []
            }
            df.incidents[bucket].push(inc)
        }
    })
    // sort codesnips by their first line
    df.codeSnips.sort((a: string, b: string) => {
        const aStartLine = getLineNumber(a)
        const bStartLine = getLineNumber(b)
        return aStartLine - bStartLine;
    })
    return df
}
