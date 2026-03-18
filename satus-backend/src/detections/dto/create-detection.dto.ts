import { IsUrl, IsNotEmpty } from 'class-validator';

export class CreateDetectionDto {
  @IsUrl()
  @IsNotEmpty()
  url: string; // La extensión solo nos mandará esto por ahora
}
