import { 
  SkillGraph, 
  SkillNode, 
  SkillEdge, 
  TalentMatch, 
  MatchedSkill,
  User,
  StudentProfile,
  TalentNeed,
  SkillRequirement 
} from '@/types/enhanced';

// Graph Engine for Talent Discovery
export class GraphEngine {
  private skillGraph: SkillGraph;
  private userProfiles: Map<string, User>;
  private skillIndex: Map<string, SkillNode>;

  constructor() {
    this.skillGraph = { nodes: [], edges: [] };
    this.userProfiles = new Map();
    this.skillIndex = new Map();
    this.initializeSkillGraph();
  }

  // Initialize skill graph with predefined relationships
  private initializeSkillGraph() {
    // Define skill nodes
    const skills = [
      // Programming Languages
      { id: 'js', label: 'JavaScript', category: 'Programming', demand: 95, supply: 80 },
      { id: 'ts', label: 'TypeScript', category: 'Programming', demand: 85, supply: 60 },
      { id: 'python', label: 'Python', category: 'Programming', demand: 90, supply: 75 },
      { id: 'java', label: 'Java', category: 'Programming', demand: 80, supply: 70 },
      { id: 'solidity', label: 'Solidity', category: 'Blockchain', demand: 70, supply: 30 },
      
      // Frameworks
      { id: 'react', label: 'React', category: 'Framework', demand: 92, supply: 65 },
      { id: 'vue', label: 'Vue.js', category: 'Framework', demand: 75, supply: 55 },
      { id: 'angular', label: 'Angular', category: 'Framework', demand: 70, supply: 50 },
      { id: 'nextjs', label: 'Next.js', category: 'Framework', demand: 80, supply: 40 },
      { id: 'django', label: 'Django', category: 'Framework', demand: 70, supply: 45 },
      
      // Web3 & Blockchain
      { id: 'web3', label: 'Web3', category: 'Blockchain', demand: 85, supply: 35 },
      { id: 'ethereum', label: 'Ethereum', category: 'Blockchain', demand: 80, supply: 40 },
      { id: 'defi', label: 'DeFi', category: 'Blockchain', demand: 75, supply: 25 },
      { id: 'nft', label: 'NFT', category: 'Blockchain', demand: 65, supply: 30 },
      { id: 'smartcontract', label: 'Smart Contracts', category: 'Blockchain', demand: 78, supply: 28 },
      
      // Cloud & DevOps
      { id: 'aws', label: 'AWS', category: 'Cloud', demand: 88, supply: 60 },
      { id: 'huaweicloud', label: 'Huawei Cloud', category: 'Cloud', demand: 70, supply: 35 },
      { id: 'docker', label: 'Docker', category: 'DevOps', demand: 85, supply: 55 },
      { id: 'k8s', label: 'Kubernetes', category: 'DevOps', demand: 80, supply: 40 },
      { id: 'cicd', label: 'CI/CD', category: 'DevOps', demand: 82, supply: 50 },
      
      // AI & Data
      { id: 'ml', label: 'Machine Learning', category: 'AI', demand: 90, supply: 45 },
      { id: 'dl', label: 'Deep Learning', category: 'AI', demand: 85, supply: 35 },
      { id: 'nlp', label: 'NLP', category: 'AI', demand: 80, supply: 30 },
      { id: 'cv', label: 'Computer Vision', category: 'AI', demand: 75, supply: 28 },
      { id: 'dataeng', label: 'Data Engineering', category: 'Data', demand: 85, supply: 40 },
    ];

    // Add nodes to graph
    skills.forEach(skill => {
      const node: SkillNode = {
        ...skill,
        trending: skill.demand > 80 && skill.supply < 50,
        metadata: {},
      };
      this.skillGraph.nodes.push(node);
      this.skillIndex.set(skill.id, node);
    });

    // Define skill relationships
    const edges = [
      // JavaScript ecosystem
      { source: 'js', target: 'ts', weight: 0.9, relationship: 'advances_to' },
      { source: 'js', target: 'react', weight: 0.8, relationship: 'requires' },
      { source: 'js', target: 'vue', weight: 0.8, relationship: 'requires' },
      { source: 'js', target: 'angular', weight: 0.8, relationship: 'requires' },
      { source: 'ts', target: 'angular', weight: 0.9, relationship: 'complements' },
      { source: 'react', target: 'nextjs', weight: 0.9, relationship: 'advances_to' },
      
      // Python ecosystem
      { source: 'python', target: 'django', weight: 0.8, relationship: 'requires' },
      { source: 'python', target: 'ml', weight: 0.85, relationship: 'complements' },
      { source: 'python', target: 'dl', weight: 0.8, relationship: 'complements' },
      { source: 'ml', target: 'dl', weight: 0.9, relationship: 'advances_to' },
      { source: 'ml', target: 'nlp', weight: 0.7, relationship: 'similar_to' },
      { source: 'ml', target: 'cv', weight: 0.7, relationship: 'similar_to' },
      
      // Blockchain ecosystem
      { source: 'js', target: 'web3', weight: 0.7, relationship: 'complements' },
      { source: 'solidity', target: 'ethereum', weight: 0.95, relationship: 'requires' },
      { source: 'solidity', target: 'smartcontract', weight: 0.95, relationship: 'requires' },
      { source: 'ethereum', target: 'defi', weight: 0.8, relationship: 'complements' },
      { source: 'ethereum', target: 'nft', weight: 0.8, relationship: 'complements' },
      { source: 'web3', target: 'ethereum', weight: 0.85, relationship: 'requires' },
      
      // Cloud & DevOps
      { source: 'docker', target: 'k8s', weight: 0.85, relationship: 'advances_to' },
      { source: 'aws', target: 'docker', weight: 0.7, relationship: 'complements' },
      { source: 'huaweicloud', target: 'docker', weight: 0.7, relationship: 'complements' },
      { source: 'cicd', target: 'docker', weight: 0.8, relationship: 'complements' },
      { source: 'cicd', target: 'k8s', weight: 0.75, relationship: 'complements' },
    ];

    // Add edges to graph
    edges.forEach(edge => {
      this.skillGraph.edges.push(edge as SkillEdge);
    });
  }

  // Find talent matches for enterprise needs
  findTalentMatches(
    talentNeed: TalentNeed,
    candidates: User[],
    options: {
      minMatchScore?: number;
      maxResults?: number;
      includeRecommendations?: boolean;
    } = {}
  ): TalentMatch[] {
    const {
      minMatchScore = 60,
      maxResults = 10,
      includeRecommendations = true,
    } = options;

    const matches: TalentMatch[] = [];

    for (const candidate of candidates) {
      if (candidate.role !== 'student') continue;
      
      const studentProfile = candidate.studentProfile;
      if (!studentProfile) continue;

      const matchResult = this.calculateMatch(
        talentNeed.requiredSkills,
        studentProfile.skills.map(s => ({
          id: s.id,
          name: s.name,
          level: s.level,
        }))
      );

      if (matchResult.score >= minMatchScore) {
        const graphPath = this.findSkillPath(
          studentProfile.skills.map(s => s.id),
          talentNeed.requiredSkills.map(r => r.skillId)
        );

        const recommendations = includeRecommendations
          ? this.generateRecommendations(
              studentProfile.skills.map(s => s.id),
              talentNeed.requiredSkills.map(r => r.skillId)
            )
          : [];

        matches.push({
          userId: candidate.id,
          profile: candidate,
          matchScore: matchResult.score,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          recommendations,
          graphPath,
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, maxResults);
  }

  // Calculate match score between required skills and candidate skills
  private calculateMatch(
    requiredSkills: SkillRequirement[],
    candidateSkills: Array<{ id: string; name: string; level: string }>
  ): {
    score: number;
    matchedSkills: MatchedSkill[];
    missingSkills: string[];
  } {
    let totalWeight = 0;
    let matchedWeight = 0;
    const matchedSkills: MatchedSkill[] = [];
    const missingSkills: string[] = [];

    for (const required of requiredSkills) {
      totalWeight += required.weight;
      
      const candidateSkill = candidateSkills.find(
        s => s.id === required.skillId || s.name === required.skillName
      );

      if (candidateSkill) {
        const levelMatch = this.compareLevels(
          candidateSkill.level,
          required.minLevel
        );
        
        if (levelMatch >= 0) {
          // Full match
          matchedWeight += required.weight;
          matchedSkills.push({
            skillName: required.skillName,
            userLevel: candidateSkill.level,
            requiredLevel: required.minLevel,
            match: true,
            score: 100,
          });
        } else {
          // Partial match (has skill but lower level)
          const partialScore = 50 + (levelMatch * 25); // 25-50% credit
          matchedWeight += required.weight * (partialScore / 100);
          matchedSkills.push({
            skillName: required.skillName,
            userLevel: candidateSkill.level,
            requiredLevel: required.minLevel,
            match: false,
            score: partialScore,
          });
        }
      } else {
        // Check for related skills
        const relatedMatch = this.findRelatedSkillMatch(
          required.skillId,
          candidateSkills.map(s => s.id)
        );
        
        if (relatedMatch) {
          // Partial credit for related skills
          const partialScore = 30;
          matchedWeight += required.weight * (partialScore / 100);
          matchedSkills.push({
            skillName: required.skillName,
            userLevel: 'related',
            requiredLevel: required.minLevel,
            match: false,
            score: partialScore,
          });
        } else {
          missingSkills.push(required.skillName);
          matchedSkills.push({
            skillName: required.skillName,
            userLevel: 'none',
            requiredLevel: required.minLevel,
            match: false,
            score: 0,
          });
        }
      }
    }

    const score = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
    
    return {
      score: Math.round(score),
      matchedSkills,
      missingSkills,
    };
  }

  // Compare skill levels
  private compareLevels(userLevel: string, requiredLevel: string): number {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const userIdx = levels.indexOf(userLevel);
    const requiredIdx = levels.indexOf(requiredLevel);
    return userIdx - requiredIdx;
  }

  // Find if user has related skills
  private findRelatedSkillMatch(
    requiredSkillId: string,
    candidateSkillIds: string[]
  ): boolean {
    for (const candidateSkillId of candidateSkillIds) {
      const edge = this.skillGraph.edges.find(
        e =>
          (e.source === requiredSkillId && e.target === candidateSkillId) ||
          (e.target === requiredSkillId && e.source === candidateSkillId)
      );
      
      if (edge && edge.weight > 0.6) {
        return true;
      }
    }
    return false;
  }

  // Find skill progression path
  private findSkillPath(
    currentSkills: string[],
    targetSkills: string[]
  ): string[] {
    const path: string[] = [];
    const visited = new Set<string>(currentSkills);
    const queue: Array<{ skill: string; path: string[] }> = [];

    // Initialize queue with current skills
    currentSkills.forEach(skill => {
      queue.push({ skill, path: [skill] });
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Check if we reached a target skill
      if (targetSkills.includes(current.skill)) {
        return current.path;
      }

      // Explore connected skills
      const edges = this.skillGraph.edges.filter(
        e => e.source === current.skill || e.target === current.skill
      );

      for (const edge of edges) {
        const nextSkill = edge.source === current.skill ? edge.target : edge.source;
        
        if (!visited.has(nextSkill)) {
          visited.add(nextSkill);
          queue.push({
            skill: nextSkill,
            path: [...current.path, nextSkill],
          });
        }
      }
    }

    return path;
  }

  // Generate learning recommendations
  private generateRecommendations(
    currentSkills: string[],
    targetSkills: string[]
  ): string[] {
    const recommendations: string[] = [];
    const missingTargets = targetSkills.filter(t => !currentSkills.includes(t));

    for (const target of missingTargets) {
      // Find prerequisites
      const prerequisites = this.findPrerequisites(target);
      const learnablePrereqs = prerequisites.filter(
        p => !currentSkills.includes(p)
      );

      if (learnablePrereqs.length > 0) {
        recommendations.push(
          `Learn ${learnablePrereqs[0]} as a prerequisite for ${target}`
        );
      } else {
        recommendations.push(`Learn ${target} to meet requirements`);
      }
    }

    // Add trending skill recommendations
    const trendingSkills = this.skillGraph.nodes
      .filter(n => n.trending && !currentSkills.includes(n.id))
      .slice(0, 2);

    trendingSkills.forEach(skill => {
      recommendations.push(`Consider learning ${skill.label} (high demand)`);
    });

    return recommendations.slice(0, 5);
  }

  // Find prerequisites for a skill
  private findPrerequisites(skillId: string): string[] {
    const prerequisites: string[] = [];
    
    const edges = this.skillGraph.edges.filter(
      e => e.target === skillId && e.relationship === 'requires'
    );

    edges.forEach(edge => {
      prerequisites.push(edge.source);
    });

    return prerequisites;
  }

  // Get skill demand/supply analytics
  getSkillAnalytics(): {
    highDemand: SkillNode[];
    lowSupply: SkillNode[];
    emerging: SkillNode[];
    saturated: SkillNode[];
  } {
    const highDemand = this.skillGraph.nodes
      .filter(n => n.demand > 80)
      .sort((a, b) => b.demand - a.demand);

    const lowSupply = this.skillGraph.nodes
      .filter(n => n.supply < 40)
      .sort((a, b) => a.supply - b.supply);

    const emerging = this.skillGraph.nodes
      .filter(n => n.demand > 70 && n.supply < 35)
      .sort((a, b) => (b.demand / b.supply) - (a.demand / a.supply));

    const saturated = this.skillGraph.nodes
      .filter(n => n.supply > 70 && n.demand < 60)
      .sort((a, b) => (b.supply / b.demand) - (a.supply / a.demand));

    return {
      highDemand: highDemand.slice(0, 10),
      lowSupply: lowSupply.slice(0, 10),
      emerging: emerging.slice(0, 5),
      saturated: saturated.slice(0, 5),
    };
  }

  // Get skill relationships
  getSkillRelationships(skillId: string): {
    prerequisites: string[];
    advances: string[];
    complements: string[];
    similar: string[];
  } {
    const prerequisites: string[] = [];
    const advances: string[] = [];
    const complements: string[] = [];
    const similar: string[] = [];

    this.skillGraph.edges.forEach(edge => {
      if (edge.source === skillId) {
        switch (edge.relationship) {
          case 'requires':
            prerequisites.push(edge.target);
            break;
          case 'advances_to':
            advances.push(edge.target);
            break;
          case 'complements':
            complements.push(edge.target);
            break;
          case 'similar_to':
            similar.push(edge.target);
            break;
        }
      } else if (edge.target === skillId) {
        switch (edge.relationship) {
          case 'requires':
            prerequisites.push(edge.source);
            break;
          case 'advances_to':
            // Reverse relationship
            break;
          case 'complements':
            complements.push(edge.source);
            break;
          case 'similar_to':
            similar.push(edge.source);
            break;
        }
      }
    });

    return {
      prerequisites: [...new Set(prerequisites)],
      advances: [...new Set(advances)],
      complements: [...new Set(complements)],
      similar: [...new Set(similar)],
    };
  }

  // Update skill demand/supply based on market data
  updateMarketData(skillId: string, demand?: number, supply?: number) {
    const node = this.skillIndex.get(skillId);
    if (node) {
      if (demand !== undefined) node.demand = demand;
      if (supply !== undefined) node.supply = supply;
      node.trending = node.demand > 80 && node.supply < 50;
    }
  }

  // Export graph for visualization
  exportGraph(): {
    nodes: Array<{ id: string; label: string; size: number; color: string }>;
    edges: Array<{ source: string; target: string; weight: number; type: string }>;
  } {
    const nodes = this.skillGraph.nodes.map(node => ({
      id: node.id,
      label: node.label,
      size: node.demand,
      color: this.getCategoryColor(node.category),
    }));

    const edges = this.skillGraph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      type: edge.relationship,
    }));

    return { nodes, edges };
  }

  // Get color for category
  private getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Programming: '#3B82F6',
      Framework: '#8B5CF6',
      Blockchain: '#F59E0B',
      Cloud: '#10B981',
      DevOps: '#EF4444',
      AI: '#EC4899',
      Data: '#6366F1',
    };
    return colors[category] || '#6B7280';
  }
}

// Export singleton instance
export const graphEngine = new GraphEngine();
