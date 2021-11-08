import express from "express";

export function getCookie(req: express.Request, name: string): string[] {
    function escape(s: string) {
        return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, '\\$1');
    }

    if (!req.headers.cookie) return [];

    // @ts-ignore
    var match = req.headers.cookie.match(RegExp('(?:^|;\\s*)' + escape(name) + '=([^;]*)'));
    return match ? match[1].split(",") : [];
}