import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { Education } from './entities/education.entity';
import { Experience } from './entities/experience.entity';
import { Skill } from './entities/skill.entity';
import { Portfolio } from './entities/portfolio.entity';

@Injectable()
export class ResumeRepository {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepo: Repository<Resume>,
    @InjectRepository(Education)
    private readonly educationRepo: Repository<Education>,
    @InjectRepository(Experience)
    private readonly experienceRepo: Repository<Experience>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

  async createResume(data: Partial<Resume>): Promise<Resume> {
    const resume = this.resumeRepo.create(data);
    return await this.resumeRepo.save(resume);
  }

  async findResumeById(id: number): Promise<Resume> {
    return await this.resumeRepo.findOne({
      where: { id },
      relations: ['educations', 'experiences', 'skills', 'portfolios'],
    });
  }

  async findResumesByUserId(userId: number): Promise<Resume[]> {
    return await this.resumeRepo.find({
      where: { userId },
      relations: ['educations', 'experiences', 'skills', 'portfolios'],
    });
  }

  async updateResume(id: number, data: Partial<Resume>): Promise<void> {
    await this.resumeRepo.update(id, data);
  }

  async deleteResume(id: number): Promise<void> {
    await this.resumeRepo.delete(id);
  }

  // Education 관련 메서드
  async addEducation(data: Partial<Education>): Promise<Education> {
    const education = this.educationRepo.create(data);
    return await this.educationRepo.save(education);
  }

  async updateEducation(id: number, data: Partial<Education>): Promise<void> {
    await this.educationRepo.update(id, data);
  }

  async deleteEducation(id: number): Promise<void> {
    await this.educationRepo.delete(id);
  }

  // Experience 관련 메서드
  async addExperience(data: Partial<Experience>): Promise<Experience> {
    const experience = this.experienceRepo.create(data);
    return await this.experienceRepo.save(experience);
  }

  async updateExperience(id: number, data: Partial<Experience>): Promise<void> {
    await this.experienceRepo.update(id, data);
  }

  async deleteExperience(id: number): Promise<void> {
    await this.experienceRepo.delete(id);
  }

  // Skill 관련 메서드
  async addSkill(data: Partial<Skill>): Promise<Skill> {
    const skill = this.skillRepo.create(data);
    return await this.skillRepo.save(skill);
  }

  async updateSkill(id: number, data: Partial<Skill>): Promise<void> {
    await this.skillRepo.update(id, data);
  }

  async deleteSkill(id: number): Promise<void> {
    await this.skillRepo.delete(id);
  }

  // Portfolio 관련 메서드
  async addPortfolio(data: Partial<Portfolio>): Promise<Portfolio> {
    const portfolio = this.portfolioRepo.create(data);
    return await this.portfolioRepo.save(portfolio);
  }

  async deletePortfolio(id: number): Promise<void> {
    await this.portfolioRepo.delete(id);
  }

  async findPortfolioById(id: number): Promise<Portfolio> {
    return await this.portfolioRepo.findOne({
      where: { id }
    });
  }

  async findPortfolioByResumeIdAndName(resumeId: number, originalName: string): Promise<Portfolio> {
    return await this.portfolioRepo.findOne({
      where: {
        resumeId,
        originalName
      }
    });
  }

  async updatePortfolio(id: number, data: Partial<Portfolio>): Promise<Portfolio> {
    await this.portfolioRepo.update(id, data);
    return await this.findPortfolioById(id);
  }
} 