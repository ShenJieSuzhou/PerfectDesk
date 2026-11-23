param([string]$Src='E:\TheRedTool\DeskToy\DeskToy\assets\pixel-workspace\atlases',[string]$Out='E:\TheRedTool\DeskToy\perfect-workstation\assets\items')
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System; using System.Drawing; using System.Drawing.Imaging; using System.Collections.Generic; using System.Runtime.InteropServices;
public static class Cutter {
  static bool IsBg(byte r, byte g, byte b){
    int mx=Math.Max(r,Math.Max(g,b)), mn=Math.Min(r,Math.Min(g,b));
    if (mx-mn>14) return false;           // colored -> object
    return mx>=150;                         // light neutral grey: background or soft shadow
  }
  public static string Run(string src, string outDir, int startId){
    Bitmap bmp=new Bitmap(src); int W=bmp.Width,H=bmp.Height;
    var bd=bmp.LockBits(new Rectangle(0,0,W,H),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
    byte[] px=new byte[W*H*4]; Marshal.Copy(bd.Scan0,px,0,px.Length); bmp.UnlockBits(bd); bmp.Dispose();
    bool[] bg=new bool[W*H]; var q=new Queue<int>();
    for(int x=0;x<W;x++){q.Enqueue(x);q.Enqueue((H-1)*W+x);} for(int y=0;y<H;y++){q.Enqueue(y*W);q.Enqueue(y*W+W-1);}
    while(q.Count>0){int i=q.Dequeue(); if(bg[i])continue; int o=i*4; if(!IsBg(px[o+2],px[o+1],px[o]))continue; bg[i]=true;
      int x=i%W,y=i/W; if(x>0)q.Enqueue(i-1); if(x<W-1)q.Enqueue(i+1); if(y>0)q.Enqueue(i-W); if(y<H-1)q.Enqueue(i+W);}
    // fill enclosed light-grey holes that are pure background tone (e.g. between legs) 
    for(int i=0;i<W*H;i++){ if(bg[i])continue; int o=i*4; byte r=px[o+2],g=px[o+1],b=px[o];
      if(Math.Abs(r-228)<6&&Math.Abs(g-230)<6&&Math.Abs(b-227)<6) bg[i]=true; }
    var sb=new System.Text.StringBuilder(); int cols=5, rows=2;
    for(int ry=0;ry<rows;ry++) for(int cx=0;cx<cols;cx++){
      int x0=cx*W/cols, x1=(cx+1)*W/cols, y0=ry*H/rows, y1=(ry+1)*H/rows;
      // components in cell
      int cw=x1-x0, ch=y1-y0; int[] lab=new int[cw*ch]; var sizes=new List<int>(); var boxes=new List<int[]>();
      for(int yy=0;yy<ch;yy++)for(int xx=0;xx<cw;xx++){int li=yy*cw+xx; if(lab[li]!=0||bg[(y0+yy)*W+x0+xx])continue;
        int id=sizes.Count+1; int cnt=0; int[] bx={xx,yy,xx,yy}; var st=new Stack<int>(); st.Push(li); lab[li]=id;
        while(st.Count>0){int c=st.Pop(); cnt++; int a=c%cw,bb=c/cw; if(a<bx[0])bx[0]=a; if(bb<bx[1])bx[1]=bb; if(a>bx[2])bx[2]=a; if(bb>bx[3])bx[3]=bb;
          for(int k=0;k<4;k++){int na=a+(k==0?1:k==1?-1:0), nb=bb+(k==2?1:k==3?-1:0); if(na<0||nb<0||na>=cw||nb>=ch)continue; int ni=nb*cw+na;
            if(lab[ni]!=0||bg[(y0+nb)*W+x0+na])continue; lab[ni]=id; st.Push(ni);}}
        sizes.Add(cnt); boxes.Add(bx);}
      int max=0; foreach(var s in sizes) if(s>max)max=s;
      var keep=new HashSet<int>(); int L=cw,T=ch,R=0,B=0;
      for(int k=0;k<sizes.Count;k++){ if(sizes[k]<Math.Max(60,max*0.004))continue; var bq=boxes[k]; if((bq[0]<=2||bq[2]>=cw-3||bq[1]<=2||bq[3]>=ch-3)&&sizes[k]<max*0.35)continue; keep.Add(k+1); var b=boxes[k]; L=Math.Min(L,b[0]);T=Math.Min(T,b[1]);R=Math.Max(R,b[2]);B=Math.Max(B,b[3]); }
      int ow=R-L+1, oh=B-T+1; var outb=new Bitmap(ow,oh,PixelFormat.Format32bppArgb);
      var od=outb.LockBits(new Rectangle(0,0,ow,oh),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb); byte[] op=new byte[ow*oh*4];
      for(int yy=0;yy<oh;yy++)for(int xx=0;xx<ow;xx++){int li=(T+yy)*cw+L+xx; if(!keep.Contains(lab[li]))continue; int si=((y0+T+yy)*W+x0+L+xx)*4, di=(yy*ow+xx)*4;
        op[di]=px[si];op[di+1]=px[si+1];op[di+2]=px[si+2];op[di+3]=255;}
      Marshal.Copy(op,0,od.Scan0,op.Length); outb.UnlockBits(od);
      // downscale 50%
      int sw=Math.Max(1,ow/2), sh=Math.Max(1,oh/2); var small=new Bitmap(sw,sh,PixelFormat.Format32bppArgb);
      using(var g=Graphics.FromImage(small)){ g.InterpolationMode=System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic; g.PixelOffsetMode=System.Drawing.Drawing2D.PixelOffsetMode.HighQuality; g.DrawImage(outb,new Rectangle(0,0,sw,sh)); }
      int id2=startId+ry*cols+cx; string name=id2.ToString("000")+".png"; small.Save(System.IO.Path.Combine(outDir,name),ImageFormat.Png); small.Dispose(); outb.Dispose();
      sb.AppendFormat("{0},{1},{2}\n",id2,sw,sh);
    }
    return sb.ToString();
  }
}
"@
$all=''
$i=1
Get-ChildItem $Src -Filter *.png | Sort-Object Name | ForEach-Object { $all += [Cutter]::Run($_.FullName,$Out,$i); $i+=10 }
Set-Content -Path (Join-Path $Out 'sizes.csv') -Value $all -Encoding UTF8
"done"

