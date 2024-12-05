import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SignalrService } from '../services/signalr.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { GeneralService } from '../services/general.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit, OnDestroy, AfterViewInit {
  
  mode: 'frames'|'urlBlob'|'mediasource'|'range' = 'frames';
  chunks: Blob[] = [];
  videoUrl: SafeUrl | null = null;
  videoUrl2: string = 'https://localhost:7296/api/test/streamRange';
  count = 0;
  apiURL!: string;
  
  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;
  private sourceBuffer!: SourceBuffer;
  
  constructor(
    public signalrService: SignalrService,
    private sanitizer: DomSanitizer,
    private generalService: GeneralService
  ) {
    this.apiURL = environment.apiUrl;
  }
  ngAfterViewInit(): void {
    if (this.mode === 'mediasource'){
      // this.configMediaSource();
      this.receiveChunkUrlBlob2();
    }  
  }
  ngOnInit() {
    if (this.mode === 'urlBlob'){
      this.receiveChunkUrlBlob();
      this.streamEndedUrlBlob();
    }  
  }
  ngOnDestroy(): void {
  }
  change(mode: any){
    this.mode = mode;
  }
  initFrames(){
    this.generalService.initFrames().subscribe(res => {

    }, (error => {
      console.log("error al iniciar frames")
    }))
  }
  receiveChunkUrlBlob(){
    this.signalrService.onReceiveChunk((chunk: any) => {
      this.count++;
      const bytes = this.signalrService.base64ToUint8Array(chunk);
      this.chunks.push(new Blob([bytes], { type: 'video/mp4' }));
      console.log(this.count);

      // if (this.count === 30){
      //   const blob = new Blob(this.chunks, { type: 'video/mp4' });
      //   this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
      // }

      const blob = new Blob(this.chunks, { type: 'video/mp4' });
      this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));

    });
  }
  streamEndedUrlBlob(){
    this.signalrService.onStreamEnded(() => {
      console.log('Stream finalizado.');
    });
  }

  //MediaSource
  configMediaSource(){
    const videoElement = this.videoPlayer.nativeElement;
    const mediaSource = this.signalrService.mediaSource;

    videoElement.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
      this.initializeSourceBuffer();
    });

    mediaSource.addEventListener('sourceended', () => {
      console.log('MediaSource ended');
    });

    mediaSource.addEventListener('error', (event) => {
      console.error('MediaSource error:', event);
    });

    // Escuchar actualizaciones de chunks en tiempo real
    this.listenForNewChunks();
  }
  initializeSourceBuffer(): void {
    const mediaSource = this.signalrService.mediaSource;
    // mediaSource.duration = 6;
    if (mediaSource.readyState === 'open') {
      this.sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');

      this.sourceBuffer.addEventListener('error', (e) => {
        console.error('SourceBuffer error:', e);
      });

      this.sourceBuffer.addEventListener('updateend', () => {
        this.processNextChunk();
      });
    }
  }
  listenForNewChunks(): void {
    const processChunks = () => {
      if (!this.sourceBuffer.updating) {
        this.processNextChunk();
      }
    };
    setInterval(processChunks, 100); // Verificar si hay nuevos chunks cada 100ms
  }
  processNextChunk(): void {
    const chunks = this.signalrService.getChunks();
    if (chunks.length > 0 && !this.sourceBuffer.updating) {
      const chunk = chunks.shift();
      if (chunk) {
        this.appendToBuffer(chunk);
      }
    }
  }
  appendToBuffer(chunk: Uint8Array): void {
    try {
      this.sourceBuffer.appendBuffer(chunk);
    } catch (e: any) {
      console.error('Error al añadir chunk al buffer:', JSON.stringify(e));

      // Manejo de errores: Si el buffer está lleno, intenta limpiar y continuar
      if (e.name === 'QuotaExceededError') {
        const videoElement = this.videoPlayer.nativeElement;
        const currentTime = videoElement.currentTime;

        // Limpia parte del buffer para hacer espacio
        this.sourceBuffer.remove(0, currentTime - 5);

        // Vuelve a intentar añadir el chunk después de limpiar
        setTimeout(() => {
          this.appendToBuffer(chunk);
        }, 100);
      }
    }
  }





  receiveChunkUrlBlob2(){
    this.signalrService.onReceiveChunk2((chunk: any) => {
      this.count++;
      const bytes = this.signalrService.base64ToUint8Array(chunk.chunk);
      this.chunks.push(new Blob([bytes], { type: 'video/mp4' }));
      console.log(this.count);
      if (this.count === 9){
        debugger
        const blob = new Blob(this.chunks, { type: 'video/mp4' });
        const reader = new FileReader();      
        // Leer el Blob como ArrayBuffer
        reader.onload = () => {
          
          const videoElement = this.videoPlayer.nativeElement;
          const mediaSource = this.signalrService.mediaSource;      
          videoElement.src = URL.createObjectURL(mediaSource);
      
          mediaSource.addEventListener('sourceopen', () => {
            const mediaSource = this.signalrService.mediaSource;
            // mediaSource.duration = 6;
            if (mediaSource.readyState === 'open') {
              this.sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E"');
        
              this.sourceBuffer.addEventListener('error', (e) => {
                console.error('SourceBuffer error:', e);
              });
        
              this.sourceBuffer.addEventListener('updateend', () => {
              });
            }
            debugger
            try {
              const arrayBuffer = reader.result as ArrayBuffer;
              this.sourceBuffer.appendBuffer(arrayBuffer);
            } catch (e: any) {
              console.error('Error al añadir chunk al buffer:', JSON.stringify(e));
        
              // Manejo de errores: Si el buffer está lleno, intenta limpiar y continuar
              if (e.name === 'QuotaExceededError') {
                const videoElement = this.videoPlayer.nativeElement;
                const currentTime = videoElement.currentTime;
        
                // Limpia parte del buffer para hacer espacio
                this.sourceBuffer.remove(0, currentTime - 5);
        
                // Vuelve a intentar añadir el chunk después de limpiar
                setTimeout(() => {
                  this.appendToBuffer(chunk);
                }, 100);
              }
            }
            
          });      
          mediaSource.addEventListener('sourceended', () => {
            console.log('MediaSource ended');
          });      
          mediaSource.addEventListener('error', (event) => {
            console.error('MediaSource error:', event);
          });
        };

        reader.readAsArrayBuffer(blob);
      }
    });
  }
}
