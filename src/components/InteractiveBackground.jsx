import { useState, useEffect, useRef, useCallback } from "react";
import { THREADS, THEME, rng } from "../data/tokens";
import { generateCustomWeaveLayersSVG, wrapSVG, downloadSVG } from "../utils/exportSVG";
import { generateCustomAnimationSequenceSVGs, downloadAllSVGs } from "../utils/exportSVG";
