/**
 * Created by phil on 2017/8/8.
 */
import Log from '../utils/logger.js';
import Browser from '../utils/browser.js';
import {BaseLoader, LoaderStatus, LoaderErrors} from './loader.js';
import {RuntimeException} from '../utils/exception.js';

class Base64Loader extends BaseLoader {
    constructor(seekHandler, config) {
        super('base64-loader');
        this.TAG = 'Base64Loader';
    }

    destroy() {
        super.destroy();
    }

    open(dataSource, range) {
        this._dataSource = dataSource;
        this._range = range;
        let segments = dataSource.data.split(dataSource.split);
        let bytesPosition = 0;
        segments.forEach((segment) => {
            let flvSegment = this.base64ToArrayBuffer(segment);
            if (this._onContentLengthKnown) {
                this._onContentLengthKnown(flvSegment.byteLength);
            }
            if (this._onDataArrival) {
                this._onDataArrival(flvSegment, bytesPosition, bytesPosition + flvSegment.byteLength);
            }
            bytesPosition += flvSegment.byteLength;
        });
        this._status = LoaderStatus.kComplete;
        if (this._onComplete) {
            this._onComplete(0, bytesPosition);
        }
    }

    decodeBase64(base64) {
        let segments = base64.split('??');
        let byteStart = 0;
        segments.forEach((segment) => {
            let flvSegment = this.base64ToArrayBuffer(segment);
            byteStart += flvSegment.byteLength;
            if (this._onContentLengthKnown) {
                this._onContentLengthKnown(flvSegment.byteLength);
            }
            if (this._onDataArrival) {
                this._onDataArrival(flvSegment, byteStart, flvSegment.byteLength);
            }
        });
    }

    base64ToArrayBuffer(base64) {
        let binary_string =  atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

export default Base64Loader;