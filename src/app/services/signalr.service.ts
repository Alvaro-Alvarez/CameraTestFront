import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private url = environment.apiUrlSignalR + 'videoStreamHub';
  private hubConnection!: HubConnection;
  public currentFrame: string | null = null;
  public currentFrame2: string | null = null;
  public currentFrame3: string | null = null;
  public currentFrame4: string | null = null;
  public currentFrame5: string | null = null;
  public currentFrame6: string | null = null;


  private videoChunks: Uint8Array[] = [];
  public mediaSource = new MediaSource();
  private mimeType: string | null = null;

  constructor() {
    this.hubConnection = new HubConnectionBuilder().withUrl(this.url).build();

    this.hubConnection.on('ReceiveFrame', (frameBase64: string) => {
      this.currentFrame = `data:image/jpeg;base64,${frameBase64}`;
    });

    this.hubConnection.on('ReceiveFrame2', (frameBase64: string) => {
      this.currentFrame2 = `data:image/jpeg;base64,${frameBase64}`;
    });

    this.hubConnection.on('ReceiveFrame3', (frameBase64: string) => {
      this.currentFrame3 = `data:image/jpeg;base64,${frameBase64}`;
    });

    this.hubConnection.on('ReceiveFrame4', (frameBase64: string) => {
      this.currentFrame4 = `data:image/jpeg;base64,${frameBase64}`;
    });

    this.hubConnection.on('ReceiveFrame5', (frameBase64: string) => {
      this.currentFrame5 = `data:image/jpeg;base64,${frameBase64}`;
    });

    this.hubConnection.on('ReceiveFrame6', (frameBase64: string) => {
      this.currentFrame6 = `data:image/jpeg;base64,${frameBase64}`;
    });
  
    this.hubConnection.on('StreamEnded', () => {
      console.log('Stream finalizado');
    });

    // this.hubConnection.on('ReceiveVideoChunkMediaSource', (data: { mimeType: string, chunk: string }) => {
    //   if (!this.mimeType) {
    //     // Si es el primer chunk, guardamos el mimeType
    //     this.mimeType = data.mimeType;
    //   }
    //   const chunkBuffer = this.base64ToUint8Array(data.chunk);
    //   console.log('Chunk length:', chunkBuffer.byteLength, 'First bytes:', chunkBuffer.slice(0, 10));
    //   this.videoChunks.push(chunkBuffer);
    // });
  
    this.hubConnection.start().catch((err) => console.error(err));
  }
  onReceiveChunk(callback: (chunk: ArrayBuffer) => void): void {
    this.hubConnection.on('ReceiveVideoChunkUrlBlob', callback);
  }

  onStreamEnded(callback: () => void): void {
    this.hubConnection.on('StreamEnded', callback);
  }

  getChunks(): Uint8Array[] {
    return this.videoChunks;
  }
  getMimeType(): string | null {
    return this.mimeType;
  }

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64); // Decodifica el Base64 a una cadena binaria.
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  onReceiveChunk2(callback: (chunk: ArrayBuffer) => void): void {
    this.hubConnection.on('ReceiveVideoChunkMediaSource', callback);
  }
}
