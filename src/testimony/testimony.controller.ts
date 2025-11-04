import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('testimonies')
export class TestimonyController {

    @Get()
    async getAllTestimonies(){
        
    }

}
