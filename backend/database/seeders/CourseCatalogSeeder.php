<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * The real Training-section course catalog requested by the client:
 * Technical Support, Salesforce, Digital Marketing, DevOps, Azure, DevOps
 * AWS, Networking, and the two Gen AI programs (content sourced from the
 * client's own "Data Analytics with Gen AI Training" / "Data Science with
 * Gen AI Training" documents). Split out from DatabaseSeeder — like
 * PageSectionSeeder, this is meant to also be run standalone against an
 * already-live production database (`php artisan db:seed
 * --class=CourseCatalogSeeder --force`), since a site that already has
 * real banners/leads/admin users still needs this catalog added on top.
 *
 * Idempotent via `Course::updateOrCreate` keyed on `slug`, so re-running
 * this (locally, then again after deploying) updates the same 9 rows
 * instead of duplicating them — an admin can also freely edit any of these
 * afterward from the admin Courses screen without a re-seed overwriting
 * their changes to fields other than the ones listed below... except it
 * *will* overwrite them, by design: re-running this is meant to push the
 * catalog content, not merge around it. If the client wants a course's
 * copy locked from a future re-seed, remove it from `$courses` below
 * first.
 *
 * ---- Display order ------------------------------------------------------
 * `courses` has no `sort_order` column (unlike Banners/Statistics/Page
 * Sections) — the public /courses endpoint just orders by `latest()`
 * (created_at desc). Rather than add a migration + admin UI field for one
 * catalog import, `created_at` is set explicitly here, staggered one
 * minute apart in *reverse* of the requested "demand sequence" (the first
 * item in $courses gets the newest timestamp), so `latest()` naturally
 * surfaces them in exactly that order — and pushes them above the older
 * demo courses from DatabaseSeeder, which is the desired effect for a real
 * catalog replacing placeholder content.
 */
class CourseCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $courseCategories = collect([
            'Technical Support', 'Salesforce', 'Digital Marketing', 'Cloud & DevOps', 'Networking', 'Data & Analytics',
        ])->mapWithKeys(fn (string $name) => [$name => Category::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['type' => 'course', 'name' => $name, 'is_active' => true]
        )]);

        // Listed in the requested "demand sequence" — index 0 gets the
        // newest `created_at` (see the class docblock), so this order is
        // exactly the order they'll appear in on /training and the
        // homepage's featured strip.
        $courses = [
            [
                'title' => 'Technical Support',
                'category' => 'Technical Support',
                'duration' => '6 weeks',
                'level' => 'beginner',
                'fee' => 8999,
                'short_description' => 'Hands-on training in IT technical support — hardware, OS, networking basics and ticketing tools — for help desk and support engineer roles.',
                'description' => 'A practical, employer-aligned technical support program covering hardware troubleshooting, Windows and Linux administration, core networking concepts and the ticketing tools support teams actually use day to day. Includes mock support scenarios and interview preparation so candidates walk in ready for a help desk or support engineer role.',
                'syllabus' => "Computer hardware & troubleshooting\nWindows & Linux OS administration basics\nNetworking fundamentals (TCP/IP, DNS, DHCP)\nRemote support tools\nTicketing systems (ServiceNow, Zendesk)\nCustomer communication & SLAs\nActive Directory basics\nMock support scenarios & interview prep",
            ],
            [
                'title' => 'Salesforce',
                'category' => 'Salesforce',
                'duration' => '8 weeks',
                'level' => 'beginner',
                'fee' => 15999,
                'short_description' => 'Salesforce Administrator & Developer fundamentals — CRM setup, automation, Apex basics and real project work for Salesforce career roles.',
                'description' => 'Covers Salesforce from the ground up — CRM configuration, automation with Flow, reports and dashboards, the security model, and an introduction to Apex and Lightning components for those heading toward development. Built around Salesforce Admin (ADM-201) certification prep plus a live project, so candidates leave with both credentials and hands-on experience.',
                'syllabus' => "Salesforce CRM fundamentals\nObjects, fields & relationships\nWorkflow, Process Builder & Flow automation\nReports & dashboards\nSecurity model — profiles, roles, permission sets\nApex & Visualforce basics\nLightning components overview\nSalesforce Admin (ADM-201) certification prep\nLive project & mock interviews",
            ],
            [
                'title' => 'Digital Marketing',
                'category' => 'Digital Marketing',
                'duration' => '6 weeks',
                'level' => 'beginner',
                'fee' => 9999,
                'short_description' => 'Practical digital marketing training covering SEO, social media, paid ads and analytics — built for real campaign execution, not just theory.',
                'description' => 'A hands-on digital marketing program spanning SEO, social media, paid advertising, content and email marketing, and performance tracking with Google Analytics. Candidates plan and run a live campaign as part of the course, then finish with interview and portfolio preparation.',
                'syllabus' => "SEO fundamentals & keyword research\nSocial media marketing (Meta, LinkedIn, Instagram)\nGoogle Ads & paid campaigns\nContent marketing & email marketing\nGoogle Analytics & performance tracking\nMarketing funnels & lead generation\nLive campaign project\nInterview & portfolio prep",
            ],
            [
                'title' => 'DevOps',
                'category' => 'Cloud & DevOps',
                'duration' => '8 weeks',
                'level' => 'intermediate',
                'fee' => 17999,
                'short_description' => 'End-to-end DevOps training — CI/CD, containers, Infrastructure as Code and monitoring — for build/release and DevOps engineer roles.',
                'description' => 'Takes candidates from Linux and Git fundamentals through building real CI/CD pipelines, containerizing applications with Docker, orchestrating with Kubernetes, and managing infrastructure as code with Terraform and Ansible. Finishes with monitoring and logging (Prometheus, Grafana, ELK) and a live project.',
                'syllabus' => "Linux & shell scripting\nGit & version control workflows\nCI/CD pipelines (Jenkins, GitHub Actions)\nDocker & containerization\nKubernetes fundamentals\nInfrastructure as Code (Terraform, Ansible)\nMonitoring & logging (Prometheus, Grafana, ELK)\nLive project & mock interviews",
            ],
            [
                'title' => 'Azure',
                'category' => 'Cloud & DevOps',
                'duration' => '6 weeks',
                'level' => 'intermediate',
                'fee' => 14999,
                'short_description' => 'Microsoft Azure fundamentals to associate-level training — core services, networking, security and deployment — aligned to AZ-900/AZ-104.',
                'description' => 'Builds from Azure core services and virtual machines through storage, identity and access management, and app deployment, with cost management and monitoring along the way. Structured around the AZ-900 and AZ-104 exam objectives, with hands-on labs throughout.',
                'syllabus' => "Azure fundamentals & core services\nAzure Virtual Machines & networking\nStorage accounts & databases\nIdentity & access management (Azure AD)\nAzure App Services & deployment\nMonitoring & cost management\nAZ-900 / AZ-104 exam prep\nHands-on labs & mock interviews",
            ],
            [
                'title' => 'DevOps AWS',
                'category' => 'Cloud & DevOps',
                'duration' => '8 weeks',
                'level' => 'intermediate',
                'fee' => 17999,
                'short_description' => 'DevOps on AWS — EC2, CI/CD pipelines, containers and Infrastructure as Code on the AWS cloud — for cloud DevOps engineer roles.',
                'description' => 'Applies DevOps practices specifically on AWS — core services like EC2, S3 and IAM, CI/CD with CodePipeline and CodeBuild, containers on ECS/EKS, and infrastructure as code with Terraform and CloudFormation. Covers monitoring with CloudWatch and auto-scaling, finishing with a live project.',
                'syllabus' => "AWS core services — EC2, S3, VPC, IAM\nCI/CD with AWS CodePipeline & CodeBuild\nDocker & Amazon ECS/EKS\nInfrastructure as Code with Terraform/CloudFormation\nMonitoring with CloudWatch\nAuto-scaling & load balancing\nAWS DevOps best practices\nLive project & mock interviews",
            ],
            [
                'title' => 'Networking',
                'category' => 'Networking',
                'duration' => '8 weeks',
                'level' => 'beginner',
                'fee' => 12999,
                'short_description' => 'Computer networking fundamentals to CCNA-level concepts — routing, switching and security — for network engineer and support roles.',
                'description' => 'Covers networking from the OSI and TCP/IP models through IP addressing, subnetting, routing, switching, VLANs and wireless networking, with network security and troubleshooting woven throughout. Aligned to CCNA-level concepts, with hands-on labs and mock interviews to close out the course.',
                'syllabus' => "Networking fundamentals (OSI & TCP/IP models)\nIP addressing & subnetting\nRouting & switching basics\nVLANs & network security\nWireless networking\nNetwork troubleshooting tools\nCCNA-aligned concepts\nHands-on labs & mock interviews",
            ],
            [
                'title' => 'Data Analytics with Gen AI Training',
                'category' => 'Data & Analytics',
                'duration' => '4 months',
                'level' => 'intermediate',
                'fee' => 24999,
                'short_description' => 'SQL, Power BI, Python statistics and Generative AI — a complete data analytics program built around real employer requirements, including hands-on Gen AI and Agentic AI modules.',
                'description' => 'A complete data analytics program: advanced SQL (including stored procedures and views), Power BI reporting and DAX, Python for statistics and inferential analytics, and a full Generative AI module covering LLMs, prompt engineering, RAG and Agentic AI. Built directly from the client-provided course curriculum.',
                // Sourced from the client's "Data Analytics with Gen AI Training.docx".
                'syllabus' => "Introduction\n"
                    ."SQL Commands: DDL, DML, DCL, TCL\n"
                    ."Aggregate Functions, Group By, Having Clause, Joins, Sub-queries, Ranking Function\n"
                    ."Analytical & Window Functions, Order By\n"
                    ."Temporary Tables, Stored Procedures, Views, Error Handling\n"
                    ."Data Connections & Data Transformation — importing, cleaning and transforming data from various sources\n"
                    ."Data Visualization — interactive reports and dashboards, visualization types, formatting\n"
                    ."DAX (Data Analysis Expressions) — calculated columns, measures, aggregation functions\n\n"
                    ."Module 1 — Python & Linux Preparatory Sessions: Python basics, IDEs, Object-Oriented Programming, hands-on assignments\n"
                    ."Module 2 — Python Libraries for Data Analytics: NumPy, Pandas, data preprocessing and visualization\n"
                    ."Module 3 — Inferential Analytics: statistics with Python, descriptive/diagnostic/inferential/prescriptive analytics, "
                    ."measures of central tendency & dispersion, quartiles and percentiles\n\n"
                    ."Generative AI: LSTM, Transformers, BERT, GPT, LLMs, Langchain, Prompt Engineering, image/text/audio-based GenAI "
                    ."applications, RAG with vector databases (ChromaDB, Pinecone), fine-tuning LLMs\n\n"
                    .'Agentic AI — Core Concepts: what Agentic AI is, how AI agents work, the role of LLMs in autonomous decision-making, '
                    .'and real business applications of autonomous AI agents',
            ],
            [
                'title' => 'Data Science with Gen AI Training',
                'category' => 'Data & Analytics',
                'duration' => '5 months',
                'level' => 'advanced',
                'fee' => 29999,
                'short_description' => 'SQL, Python, Machine Learning, Deep Learning and Generative AI — an end-to-end data science program covering predictive analytics through Agentic AI.',
                'description' => 'An end-to-end data science program: SQL and Power BI, Python for inferential statistics, a full Machine Learning module (regression, classification, clustering and more), Deep Learning and NLP, and a complete Generative AI module covering LLMs, RAG and Agentic AI. Built directly from the client-provided course curriculum.',
                // Sourced from the client's "Data Science with Gen AI Training.docx".
                'syllabus' => "Introduction\n"
                    ."SQL Commands: DDL, DML, DCL, TCL\n"
                    ."Aggregate Functions, Group By, Having Clause, Joins, Sub-queries, Ranking Function\n"
                    ."Analytical & Window Functions, Order By\n"
                    ."Data Connections & Data Transformation — importing, cleaning and transforming data from various sources\n"
                    ."Data Visualization — interactive reports and dashboards, visualization types, formatting\n"
                    ."DAX (Data Analysis Expressions) — calculated columns, measures, aggregation functions\n\n"
                    ."Module 1 — Python & Linux Preparatory Sessions: Python basics, IDEs, Object-Oriented Programming, hands-on assignments\n"
                    ."Module 2 — Python Libraries for Data Science: NumPy, Pandas, data preprocessing and visualization\n"
                    ."Module 3 — Inferential Analytics: statistics with Python, descriptive/diagnostic/inferential/prescriptive analytics, "
                    ."measures of central tendency & dispersion, quartiles and percentiles\n\n"
                    ."Machine Learning: Regression, Classification, Clustering, Linear & Logistic Regression, Decision Tree, Random Forest, "
                    ."SVM, KNN, Time Series Forecasting, performance metrics, K-means, dimensionality reduction (LDA, PCA), Bagging & Boosting\n\n"
                    ."Cognitive Science & AI: Neural Networks, Deep Learning, Text Mining & NLTK, sentiment analysis, sequence tagging & "
                    ."language modeling, AI chatbots & recommendation engines\n\n"
                    ."Generative AI: LSTM, Transformers, BERT, GPT, LLMs, Langchain, Prompt Engineering, image/text/audio-based GenAI "
                    ."applications, RAG with vector databases (ChromaDB, Pinecone), fine-tuning LLMs\n\n"
                    .'Agentic AI — Core Concepts: what Agentic AI is, how AI agents work, the role of LLMs in autonomous decision-making, '
                    .'and real business applications of autonomous AI agents',
            ],
        ];

        $anchor = now();

        foreach ($courses as $index => $c) {
            $title = $c['title'];
            $timestamp = $anchor->copy()->subMinutes($index);

            Course::updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'category_id' => $courseCategories[$c['category']]->id,
                    'title' => $title,
                    'short_description' => $c['short_description'],
                    'description' => $c['description'],
                    'duration' => $c['duration'],
                    'level' => $c['level'],
                    'mode' => 'hybrid',
                    'fee' => $c['fee'],
                    'syllabus' => $c['syllabus'],
                    'is_featured' => false,
                    'is_active' => true,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]
            );
        }
    }
}
