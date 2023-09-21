import { IncidentDto } from "@app/api/report";

// DispersedFile stores different ranges of source code snips we get for each file
// since we do not index an entire file, we keep track of ranges of code snips for 
// a file, merging overlapping code snips, this helps us reduce total tabs in modal
export interface DispersedFile {
    content: {
        [key: number]: string;
    };
    ranges: number[];
    totalSnips: number;
    totalIncidents: number;
    name: string;
    displayName: string;
    incidents: {
        [key: number]: IncidentCoordinates[];
    };
}

export interface IncidentCoordinates {
    lineNumber: number;
    message: string;
}

export const getCodeSnip = (df: DispersedFile, idx: number): string => {
    let codeSnip = "";
    for (let i = df.ranges[idx*2]; i <= df.ranges[idx*2+1]; i += 1) {
        codeSnip += df.content[i] + "\n";
    }
    return codeSnip;
};

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

export const addIncidentToDispersedFile = (df: DispersedFile, incident: IncidentDto) => {
    const content = incident.codeSnip;
    const contentList: string[] = (content.split("\n") || []).filter(a => a && a !== "");
    if (!contentList) {
        return
    }
    const getLineNumber = (s: string) => {
        const m = s.match(/^ *(\d+)?.*/)
        return m ? parseInt(m[1]) : -1
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
        df.totalSnips = df.ranges.length / 2
    }
    contentList.forEach((c, idx) => {
        const lineNo = getLineNumber(contentList[idx])
        if (lineNo >= 0) {
            df.content[lineNo] = c
        }
    })
    if (incident.lineNumber !== undefined && !isNaN(incident.lineNumber)) {
        const bucket = bisect_right(df.ranges, incident.lineNumber) / 2;
        if (!df.incidents[bucket]) {
            df.incidents[bucket] = [];
        }
        df.incidents[bucket].push({...incident})
    }
    df.totalIncidents += 1
}