import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateDetectionDto {
  @IsString() 
  //@IsUrl()
  @IsNotEmpty()
  //url: string; // La extensión solo nos mandará esto por ahora
  readonly url: string;
}
